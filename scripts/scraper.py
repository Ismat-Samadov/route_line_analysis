import requests
import csv
import time
import os
import re

ALGOLIA_URL = "https://igsyv1z1xi-dsn.algolia.net/1/indexes/*/queries"
ALGOLIA_AGENT = (
    "Algolia for JavaScript (5.0.0); Search (5.0.0); Browser; "
    "instantsearch.js (4.78.1); react (19.1.0-canary-029e8bd6-20250306); "
    "react-instantsearch (7.15.5); react-instantsearch-core (7.15.5); "
    "next.js (15.2.9); JS Helper (3.24.3)"
)
API_KEY = "6658746ce52e30dacfdd8ba5f8e8cf18"
APP_ID = "IGSYV1Z1XI"

PARAMS = {
    "x-algolia-agent": ALGOLIA_AGENT,
    "x-algolia-api-key": API_KEY,
    "x-algolia-application-id": APP_ID,
}

HEADERS = {
    "accept": "application/json",
    "accept-encoding": "gzip, deflate, br",
    "content-type": "text/plain",
    "origin": "https://www.edx.org",
    "referer": "https://www.edx.org/",
    "user-agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/145.0.0.0 Safari/537.36"
    ),
}

BASE_FILTERS = (
    '(product:"Course" OR product:"Program" OR product:"Executive Education" OR product:"2U Degree") '
    'AND (locationRestrictions.blockedIn:null OR NOT locationRestrictions.blockedIn:"AZ") '
    'AND (locationRestrictions.allowedIn:null OR locationRestrictions.allowedIn:"AZ") '
    'AND showInAlgoliaSearchResults:true'
)

HITS_PER_PAGE = 50  # max allowed by algolia for this index

CSV_FIELDS = [
    "objectID",
    "productUuid",
    "title",
    "partner",
    "product",
    "productType",
    "productSource",
    "level",
    "subject",
    "language",
    "availability",
    "flexibility",
    "skills",
    "url",
    "image_url",
    "short_description",
    "weeks_to_complete",
    "weeks_to_complete_min",
    "weeks_to_complete_max",
    "min_hours_per_week",
    "max_hours_per_week",
    "recent_enrollment_count",
    "is_part_of_program",
    "active_run_key",
]

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "data.csv")
EDX_BASE_URL = "https://www.edx.org"


def strip_html(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"<[^>]+>", "", text).strip()


def join_list(value) -> str:
    if isinstance(value, list):
        return "; ".join(str(v) for v in value if v is not None)
    return str(value) if value else ""


def post(body: dict) -> dict:
    resp = requests.post(ALGOLIA_URL, params=PARAMS, headers=HEADERS, json=body, timeout=30)
    resp.raise_for_status()
    return resp.json()["results"][0]


def build_query(facet_filters: list, page: int) -> dict:
    return {
        "indexName": "rv_product_summary",
        "facetFilters": facet_filters,
        "facets": ["attributes", "level"],
        "filters": BASE_FILTERS,
        "hitsPerPage": HITS_PER_PAGE,
        "maxValuesPerFacet": 500,
        "page": page,
    }


def extract_fields(hit: dict) -> dict:
    slug = hit.get("productSlug", "")
    url = f"{EDX_BASE_URL}/{slug}" if slug else hit.get("externalUrl", "")
    skills_raw = hit.get("skills", [])
    skills = "; ".join(skills_raw) if isinstance(skills_raw, list) else str(skills_raw)
    return {
        "objectID": hit.get("objectID", ""),
        "productUuid": hit.get("productUuid", ""),
        "title": hit.get("productName", ""),
        "partner": join_list(hit.get("partner", hit.get("partnerName", ""))),
        "product": hit.get("product", ""),
        "productType": hit.get("productType", ""),
        "productSource": hit.get("productSource", ""),
        "level": hit.get("level", ""),
        "subject": join_list(hit.get("attributes", [])),
        "language": join_list(hit.get("language", [])),
        "availability": join_list(hit.get("availability", [])),
        "flexibility": hit.get("flexibility", ""),
        "skills": skills,
        "url": url,
        "image_url": hit.get("productImageUrl", ""),
        "short_description": strip_html(hit.get("shortDescription", "")),
        "weeks_to_complete": hit.get("weeksToComplete", ""),
        "weeks_to_complete_min": hit.get("weeksToCompleteMin", ""),
        "weeks_to_complete_max": hit.get("weeksToCompleteMax", ""),
        "min_hours_per_week": hit.get("minHoursEffortPerWeek", ""),
        "max_hours_per_week": hit.get("maxHoursEffortPerWeek", ""),
        "recent_enrollment_count": hit.get("recentEnrollmentCount", ""),
        "is_part_of_program": hit.get("isPartOfProgram", ""),
        "active_run_key": hit.get("activeRunKey", ""),
    }


def _paginate(facet_filters: list, seen: dict) -> int:
    """Paginate through all pages of a segment (assumes nbHits <= 1000)."""
    result = post({"requests": [build_query(facet_filters, 0)]})
    nb_pages = result.get("nbPages", 1)
    added = 0
    for hit in result.get("hits", []):
        oid = hit.get("objectID")
        if oid and oid not in seen:
            seen[oid] = extract_fields(hit)
            added += 1
    for page in range(1, nb_pages):
        time.sleep(0.25)
        result = post({"requests": [build_query(facet_filters, page)]})
        for hit in result.get("hits", []):
            oid = hit.get("objectID")
            if oid and oid not in seen:
                seen[oid] = extract_fields(hit)
                added += 1
    return added


def scrape_segment(facet_filters: list, label: str, seen: dict, _split_by: str = "level") -> int:
    """Paginate a filtered segment; if > 1000 hits, split by level once."""
    result = post({"requests": [build_query(facet_filters, 0)]})
    nb_hits = result.get("nbHits", 0)

    if nb_hits > 1000:
        print(f"  WARNING: segment '{label}' has {nb_hits} hits > 1000, splitting by {_split_by}...")
        sub_values = list(result.get("facets", {}).get(_split_by, {}).keys())
        # Avoid splitting on a dimension that's already in the filters
        existing = {f.split(":")[0] for f in facet_filters}
        if _split_by in existing or not sub_values:
            # Can't split further — just paginate (will be capped at 1000 by Algolia)
            return _paginate(facet_filters, seen)
        added = 0
        for val in sub_values:
            added += scrape_segment(
                facet_filters + [f"{_split_by}:{val}"],
                f"{label} / {val}",
                seen,
                _split_by=_split_by,
            )
        return added

    return _paginate(facet_filters, seen)


def get_all_subjects() -> list[str]:
    result = post({"requests": [{
        "indexName": "rv_product_summary",
        "facetFilters": ["product:Course"],
        "facets": ["attributes"],
        "filters": BASE_FILTERS,
        "hitsPerPage": 0,
        "maxValuesPerFacet": 500,
        "page": 0,
    }]})
    subjects = result.get("facets", {}).get("attributes", {})
    return sorted(subjects.keys())


def scrape_all_courses() -> list[dict]:
    seen: dict[str, dict] = {}  # objectID -> row

    print("Fetching all subject facets...")
    subjects = get_all_subjects()
    print(f"Found {len(subjects)} subjects: {subjects}\n")

    for subject in subjects:
        added = scrape_segment(
            facet_filters=["product:Course", f"attributes:{subject}"],
            label=subject,
            seen=seen,
        )
        print(f"  [{subject}]  +{added} new  (total: {len(seen)})")
        time.sleep(0.2)

    # Catch courses with no subject tag — simple paginated pass (Algolia caps at 1000,
    # but seen already has ~5100 entries so we only pick up the small remainder)
    print("\nFinal sweep (catching courses with no subject tag)...")
    added = _paginate(facet_filters=["product:Course"], seen=seen)
    print(f"  [(no subject sweep)]  +{added} new  (total: {len(seen)})")

    return list(seen.values())


def save_to_csv(courses: list[dict], path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(courses)
    print(f"\nSaved {len(courses)} courses to {path}")


if __name__ == "__main__":
    courses = scrape_all_courses()
    save_to_csv(courses, OUTPUT_PATH)
