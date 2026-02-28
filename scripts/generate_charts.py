import csv
import collections
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np

# ── paths ──────────────────────────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "data.csv")
CHARTS_DIR = os.path.join(os.path.dirname(__file__), "..", "charts")
os.makedirs(CHARTS_DIR, exist_ok=True)

# ── style ──────────────────────────────────────────────────────────────────────
PALETTE = [
    "#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#F97316", "#6366F1", "#84CC16", "#EC4899",
    "#14B8A6", "#A855F7", "#FB923C", "#22D3EE", "#4ADE80",
]
ACCENT  = "#2563EB"
ACCENT2 = "#10B981"
ACCENT3 = "#F59E0B"
GRAY    = "#94A3B8"
BG      = "#F8FAFC"

plt.rcParams.update({
    "figure.facecolor":  BG,
    "axes.facecolor":    BG,
    "axes.spines.top":   False,
    "axes.spines.right": False,
    "axes.spines.left":  False,
    "axes.grid":         True,
    "axes.grid.axis":    "x",
    "grid.color":        "#E2E8F0",
    "grid.linewidth":    0.8,
    "font.family":       "DejaVu Sans",
    "font.size":         11,
    "axes.titlesize":    14,
    "axes.titleweight":  "bold",
    "axes.labelsize":    11,
    "xtick.labelsize":   10,
    "ytick.labelsize":   10,
    "legend.frameon":    False,
})

def save(fig, name):
    path = os.path.join(CHARTS_DIR, name)
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"  saved {name}")

def hbar(ax, labels, values, color=ACCENT, value_fmt="{:,.0f}"):
    y = np.arange(len(labels))
    bars = ax.barh(y, values, color=color, height=0.6, zorder=3)
    ax.set_yticks(y)
    ax.set_yticklabels(labels)
    ax.invert_yaxis()
    ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{x:,.0f}"))
    max_v = max(values) if values else 1
    for bar, val in zip(bars, values):
        ax.text(bar.get_width() + max_v * 0.01, bar.get_y() + bar.get_height() / 2,
                value_fmt.format(val), va="center", ha="left", fontsize=9, color="#475569")
    ax.set_xlim(0, max_v * 1.18)
    ax.tick_params(axis="y", length=0)
    return bars

# ── load data ─────────────────────────────────────────────────────────────────
with open(DATA_PATH, newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 1 — Course Catalog Size by Subject
# ═══════════════════════════════════════════════════════════════════════════════
sub_count = collections.Counter()
for r in rows:
    for s in r["subject"].split("; "):
        if s:
            sub_count[s] += 1

top_subs = sub_count.most_common(15)
labels, vals = zip(*reversed(top_subs))

fig, ax = plt.subplots(figsize=(10, 7))
fig.suptitle("Course Catalog Size by Subject", x=0.05, ha="left", fontsize=15, fontweight="bold", y=1.01)
ax.set_title("Number of available courses per subject area  •  Top 15", fontsize=10,
             color="#64748B", loc="left", pad=6)
hbar(ax, labels, vals)
ax.set_xlabel("Number of Courses")
ax.axvlines = None
save(fig, "01_catalog_size_by_subject.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 2 — Average Enrollment per Course by Subject  (demand efficiency)
# ═══════════════════════════════════════════════════════════════════════════════
sub_enroll = collections.defaultdict(int)
sub_cnt    = collections.defaultdict(int)
for r in rows:
    e = int(r["recent_enrollment_count"])
    for s in r["subject"].split("; "):
        if s:
            sub_enroll[s] += e
            sub_cnt[s]    += 1

avg_enroll = {s: sub_enroll[s] / sub_cnt[s] for s in sub_enroll}
top_avg = sorted(avg_enroll.items(), key=lambda x: x[1], reverse=True)[:15]
labels2, vals2 = zip(*reversed(top_avg))

fig, ax = plt.subplots(figsize=(10, 7))
fig.suptitle("Learner Demand per Course by Subject", x=0.05, ha="left", fontsize=15, fontweight="bold", y=1.01)
ax.set_title("Average recent enrollments per course  •  Top 15", fontsize=10,
             color="#64748B", loc="left", pad=6)
colors2 = [ACCENT2 if v >= 800 else ACCENT for v in vals2]
hbar(ax, labels2, list(vals2), color=list(reversed(colors2)), value_fmt="{:,.0f}")
ax.set_xlabel("Avg Enrollments per Course")
save(fig, "02_avg_enrollment_by_subject.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 3 — Top 15 Partners by Total Enrollment
# ═══════════════════════════════════════════════════════════════════════════════
p_enroll = collections.defaultdict(int)
for r in rows:
    p_enroll[r["partner"]] += int(r["recent_enrollment_count"])

top_p = sorted(p_enroll.items(), key=lambda x: x[1], reverse=True)[:15]
labels3, vals3 = zip(*reversed(top_p))

fig, ax = plt.subplots(figsize=(11, 7))
fig.suptitle("Top 15 Partners by Total Learner Enrollment", x=0.05, ha="left", fontsize=15,
             fontweight="bold", y=1.01)
ax.set_title("Cumulative recent enrollments across all partner courses", fontsize=10,
             color="#64748B", loc="left", pad=6)
colors3 = [ACCENT if v < 1_000_000 else "#EF4444" for v in vals3]
hbar(ax, labels3, list(vals3), color=list(reversed(colors3)))
ax.set_xlabel("Total Enrollments")
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{x/1e6:.1f}M" if x >= 1e6 else f"{x/1e3:.0f}K"))
save(fig, "03_top_partners_total_enrollment.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 4 — Partner Avg Enrollment vs Course Count (efficiency map)
# ═══════════════════════════════════════════════════════════════════════════════
p_count = collections.defaultdict(int)
for r in rows:
    p_count[r["partner"]] += 1

# Top 20 by total enrollment
top20 = sorted(p_enroll.items(), key=lambda x: x[1], reverse=True)[:20]
p_names   = [p for p, _ in top20]
p_totals  = [p_enroll[p] for p in p_names]
p_avgs    = [p_enroll[p] / p_count[p] for p in p_names]
p_counts  = [p_count[p] for p in p_names]

# Sort by avg
order = sorted(range(len(p_names)), key=lambda i: p_avgs[i])
p_names_s  = [p_names[i] for i in order]
p_avgs_s   = [p_avgs[i] for i in order]
p_counts_s = [p_counts[i] for i in order]

fig, ax = plt.subplots(figsize=(11, 8))
fig.suptitle("Partner Efficiency: Avg Enrollment per Course", x=0.05, ha="left",
             fontsize=15, fontweight="bold", y=1.01)
ax.set_title("Top 20 partners by total enrollment  •  bar = avg enrollments/course  •  number = course count",
             fontsize=10, color="#64748B", loc="left", pad=6)
y = np.arange(len(p_names_s))
bars = ax.barh(y, p_avgs_s, color=ACCENT, height=0.6, zorder=3)
ax.set_yticks(y)
ax.set_yticklabels(p_names_s)
ax.set_xlabel("Avg Enrollments per Course")
ax.invert_yaxis()
max_v = max(p_avgs_s)
for bar, val, cnt in zip(bars, p_avgs_s, p_counts_s):
    ax.text(bar.get_width() + max_v * 0.01, bar.get_y() + bar.get_height() / 2,
            f"{val:,.0f}  ({cnt} courses)", va="center", ha="left", fontsize=9, color="#475569")
ax.set_xlim(0, max_v * 1.35)
ax.tick_params(axis="y", length=0)
save(fig, "04_partner_efficiency.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 5 — Difficulty Level: Course Count vs Total Enrollment
# ═══════════════════════════════════════════════════════════════════════════════
levels_order = ["Introductory", "Intermediate", "Advanced"]
lev_cnt   = collections.Counter(r["level"] for r in rows)
lev_enroll= collections.defaultdict(int)
for r in rows:
    lev_enroll[r["level"]] += int(r["recent_enrollment_count"])

x = np.arange(len(levels_order))
w = 0.35
cnt_vals = [lev_cnt[l] for l in levels_order]
enr_vals = [lev_enroll[l] for l in levels_order]

fig, ax1 = plt.subplots(figsize=(9, 5))
fig.suptitle("Course Difficulty: Supply vs. Demand", x=0.05, ha="left",
             fontsize=15, fontweight="bold", y=1.01)
ax1.set_title("Number of courses (left axis) vs. total enrollments (right axis)", fontsize=10,
              color="#64748B", loc="left", pad=6)

ax2 = ax1.twinx()
ax2.spines["right"].set_visible(True)
ax2.spines["top"].set_visible(False)

b1 = ax1.bar(x - w/2, cnt_vals, w, color=ACCENT, label="# Courses", zorder=3)
b2 = ax2.bar(x + w/2, enr_vals, w, color=ACCENT2, label="Total Enrollments", zorder=3)

ax1.set_xticks(x)
ax1.set_xticklabels(levels_order)
ax1.set_ylabel("Number of Courses", color=ACCENT)
ax2.set_ylabel("Total Enrollments", color=ACCENT2)
ax1.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v:,.0f}"))
ax2.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v/1e6:.1f}M"))
ax1.tick_params(axis="y", colors=ACCENT)
ax2.tick_params(axis="y", colors=ACCENT2)
ax1.grid(axis="y", color="#E2E8F0")
ax2.grid(False)
ax1.spines["left"].set_visible(False)

for bar, val in zip(b1, cnt_vals):
    ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 30, f"{val:,}",
             ha="center", va="bottom", fontsize=10, color=ACCENT, fontweight="bold")
for bar, val in zip(b2, enr_vals):
    ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 10000, f"{val/1e6:.1f}M",
             ha="center", va="bottom", fontsize=10, color=ACCENT2, fontweight="bold")

lines = [plt.Line2D([0],[0],color=ACCENT,lw=6,label="# Courses"),
         plt.Line2D([0],[0],color=ACCENT2,lw=6,label="Total Enrollments")]
ax1.legend(handles=lines, loc="upper right")
save(fig, "05_level_supply_vs_demand.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 6 — Self-Paced vs Instructor-Paced
# ═══════════════════════════════════════════════════════════════════════════════
flex_cnt    = collections.Counter(r["flexibility"] for r in rows)
flex_enroll = collections.defaultdict(int)
for r in rows:
    flex_enroll[r["flexibility"]] += int(r["recent_enrollment_count"])

flex_labels = ["Self-Paced", "Instructor-Paced"]
flex_keys   = ["self_paced", "instructor_paced"]
f_cnt  = [flex_cnt[k]    for k in flex_keys]
f_enr  = [flex_enroll[k] for k in flex_keys]
f_avg  = [flex_enroll[k] / flex_cnt[k] for k in flex_keys]

x = np.arange(2)
w = 0.3
fig, axes = plt.subplots(1, 3, figsize=(13, 5))
fig.suptitle("Self-Paced vs. Instructor-Paced Courses", x=0.05, ha="left",
             fontsize=15, fontweight="bold", y=1.03)

titles = ["Number of Courses", "Total Enrollments", "Avg Enrollment per Course"]
data   = [f_cnt, f_enr, f_avg]
fmts   = ["{:,.0f}", "{:,.0f}", "{:,.0f}"]
cols   = [ACCENT, ACCENT2, ACCENT3]

for ax, title, d, col in zip(axes, titles, data, cols):
    ax.set_facecolor(BG)
    bars = ax.bar(flex_labels, d, color=[col, GRAY], width=0.5, zorder=3)
    ax.set_title(title, fontsize=11, fontweight="bold")
    ax.set_ylim(0, max(d) * 1.25)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(
        lambda v, _: f"{v/1e6:.1f}M" if v >= 1e6 else f"{v:,.0f}"))
    ax.grid(axis="y", color="#E2E8F0")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_visible(False)
    for bar, val in zip(bars, d):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(d)*0.02,
                f"{val:,.0f}", ha="center", va="bottom", fontsize=10, fontweight="bold")

plt.tight_layout()
save(fig, "06_self_paced_vs_instructor.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 7 — Course Duration Distribution
# ═══════════════════════════════════════════════════════════════════════════════
dur_labels  = ["1–2 wks", "3–4 wks", "5–6 wks", "7–8 wks", "9–12 wks", "13+ wks"]
dur_buckets = ["1-2w",    "3-4w",    "5-6w",    "7-8w",    "9-12w",    "13w+"]
dur_cnt     = collections.Counter()
dur_enr     = collections.defaultdict(int)

for r in rows:
    w = int(r["weeks_to_complete"]) if r["weeks_to_complete"] else 0
    if   w <= 2:  key = "1-2w"
    elif w <= 4:  key = "3-4w"
    elif w <= 6:  key = "5-6w"
    elif w <= 8:  key = "7-8w"
    elif w <= 12: key = "9-12w"
    else:         key = "13w+"
    dur_cnt[key] += 1
    dur_enr[key] += int(r["recent_enrollment_count"])

d_cnt = [dur_cnt[k] for k in dur_buckets]
d_enr = [dur_enr[k] for k in dur_buckets]
d_avg = [dur_enr[k] / dur_cnt[k] if dur_cnt[k] else 0 for k in dur_buckets]

x = np.arange(len(dur_labels))
w = 0.35
fig, ax1 = plt.subplots(figsize=(11, 5))
fig.suptitle("Course Duration: Supply vs. Learner Preference", x=0.05, ha="left",
             fontsize=15, fontweight="bold", y=1.01)
ax1.set_title("Number of courses (bars) vs. avg enrollment per course (line)", fontsize=10,
              color="#64748B", loc="left", pad=6)

ax2 = ax1.twinx()
ax2.spines["right"].set_visible(True)
ax2.spines["top"].set_visible(False)
ax1.spines["left"].set_visible(False)

bars = ax1.bar(x, d_cnt, color=ACCENT, width=0.6, zorder=3, label="# Courses")
ax2.plot(x, d_avg, color=ACCENT3, marker="o", linewidth=2.5, markersize=7,
         label="Avg Enrollments", zorder=4)

ax1.set_xticks(x)
ax1.set_xticklabels(dur_labels)
ax1.set_ylabel("Number of Courses", color=ACCENT)
ax2.set_ylabel("Avg Enrollments per Course", color=ACCENT3)
ax1.tick_params(axis="y", colors=ACCENT)
ax2.tick_params(axis="y", colors=ACCENT3)
ax1.grid(axis="y", color="#E2E8F0")
ax2.grid(False)

for bar, val in zip(bars, d_cnt):
    ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 20, f"{val:,}",
             ha="center", va="bottom", fontsize=9, color=ACCENT)
for xi, val in zip(x, d_avg):
    ax2.text(xi, val + max(d_avg)*0.04, f"{val:,.0f}",
             ha="center", va="bottom", fontsize=9, color=ACCENT3)

lines = [plt.Line2D([0],[0],color=ACCENT,lw=6,label="# Courses"),
         plt.Line2D([0],[0],color=ACCENT3,marker="o",lw=2,label="Avg Enrollments")]
ax1.legend(handles=lines, loc="upper right")
save(fig, "07_duration_distribution.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 8 — Subject × Level Composition (stacked bar)
# ═══════════════════════════════════════════════════════════════════════════════
focus_subs = [
    "Computer Science", "Business & Management", "Data Analysis & Statistics",
    "Engineering", "Economics & Finance", "Social Sciences",
    "Communication", "Health & Safety", "Environmental Studies", "Math",
]
sub_lev = collections.defaultdict(lambda: collections.Counter())
for r in rows:
    for s in r["subject"].split("; "):
        if s:
            sub_lev[s][r["level"]] += 1

intro_v = [sub_lev[s]["Introductory"] for s in focus_subs]
inter_v = [sub_lev[s]["Intermediate"] for s in focus_subs]
adv_v   = [sub_lev[s]["Advanced"]     for s in focus_subs]
totals  = [i+n+a for i,n,a in zip(intro_v, inter_v, adv_v)]
order   = sorted(range(len(focus_subs)), key=lambda i: totals[i])
subs_s  = [focus_subs[i] for i in order]
intro_s = [intro_v[i]    for i in order]
inter_s = [inter_v[i]    for i in order]
adv_s   = [adv_v[i]      for i in order]

y = np.arange(len(subs_s))
fig, ax = plt.subplots(figsize=(11, 7))
fig.suptitle("Course Depth by Subject Area", x=0.05, ha="left",
             fontsize=15, fontweight="bold", y=1.01)
ax.set_title("Stack shows share of Introductory / Intermediate / Advanced courses per subject",
             fontsize=10, color="#64748B", loc="left", pad=6)

b1 = ax.barh(y, intro_s, height=0.6, color=ACCENT,  label="Introductory", zorder=3)
b2 = ax.barh(y, inter_s, height=0.6, left=intro_s,  color=ACCENT2, label="Intermediate", zorder=3)
b3 = ax.barh(y, adv_s,   height=0.6,
             left=[a+b for a,b in zip(intro_s, inter_s)], color=ACCENT3, label="Advanced", zorder=3)

ax.set_yticks(y)
ax.set_yticklabels(subs_s)
ax.set_xlabel("Number of Courses")
ax.legend(loc="lower right")
ax.tick_params(axis="y", length=0)
ax.grid(axis="x", color="#E2E8F0")
ax.spines["bottom"].set_visible(True)
save(fig, "08_subject_level_stack.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 9 — Top 20 In-Demand Skills
# ═══════════════════════════════════════════════════════════════════════════════
skill_count = collections.Counter()
for r in rows:
    if r["skills"]:
        for sk in r["skills"].split("; "):
            if sk.strip():
                skill_count[sk.strip()] += 1

top_skills = skill_count.most_common(20)
sk_labels, sk_vals = zip(*reversed(top_skills))

fig, ax = plt.subplots(figsize=(10, 8))
fig.suptitle("Top 20 Skills Taught Across the Platform", x=0.05, ha="left",
             fontsize=15, fontweight="bold", y=1.01)
ax.set_title("Number of courses covering each skill", fontsize=10,
             color="#64748B", loc="left", pad=6)
colors_sk = [ACCENT3 if "AI" in l or "Machine" in l or "Python" in l or "Data" in l else ACCENT
             for l in sk_labels]
hbar(ax, sk_labels, list(sk_vals), color=list(reversed(colors_sk)))
ax.set_xlabel("Number of Courses")

from matplotlib.patches import Patch
legend_els = [Patch(facecolor=ACCENT, label="General Skills"),
              Patch(facecolor=ACCENT3, label="Tech / Data Skills")]
ax.legend(handles=legend_els, loc="lower right")
save(fig, "09_top_skills.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 10 — Enrollment Concentration (top 10 vs rest)
# ═══════════════════════════════════════════════════════════════════════════════
enrollments = sorted(
    [(r["title"], r["partner"], int(r["recent_enrollment_count"])) for r in rows],
    key=lambda x: x[2], reverse=True,
)
top10_sum  = sum(e for _, _, e in enrollments[:10])
rest_sum   = sum(e for _, _, e in enrollments[10:])
total_enr  = top10_sum + rest_sum

top10_names = [f"{t[:35]}…" if len(t)>35 else t for t, _, _ in enrollments[:10]]
top10_vals  = [e for _, _, e in enrollments[:10]]

fig, axes = plt.subplots(1, 2, figsize=(15, 6),
                          gridspec_kw={"width_ratios": [2, 1]})
fig.suptitle("Enrollment Concentration: A Platform-Wide Imbalance", x=0.02, ha="left",
             fontsize=15, fontweight="bold", y=1.02)

# Left: top 10 courses
ax = axes[0]
ax.set_facecolor(BG)
ax.set_title("Top 10 Most-Enrolled Courses", fontsize=12, fontweight="bold", loc="left")
y = np.arange(10)
bars = ax.barh(y, top10_vals, color=ACCENT, height=0.6, zorder=3)
ax.set_yticks(y)
ax.set_yticklabels(top10_names, fontsize=9)
ax.invert_yaxis()
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v/1e3:.0f}K"))
ax.tick_params(axis="y", length=0)
ax.grid(axis="x", color="#E2E8F0")
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.spines["left"].set_visible(False)
for bar, val in zip(bars, top10_vals):
    ax.text(bar.get_width() + max(top10_vals)*0.01, bar.get_y() + bar.get_height()/2,
            f"{val:,}", va="center", fontsize=9, color="#475569")
ax.set_xlim(0, max(top10_vals)*1.18)

# Right: concentration summary
ax2 = axes[1]
ax2.set_facecolor(BG)
ax2.set_title("Share of Total Enrollments", fontsize=12, fontweight="bold", loc="left")
categories = [f"Top 10 Courses\n({top10_sum/total_enr*100:.0f}%)", f"Remaining\n5,097 Courses\n({rest_sum/total_enr*100:.0f}%)"]
vals_c = [top10_sum, rest_sum]
bars2 = ax2.bar(categories, vals_c, color=[ACCENT, GRAY], width=0.5, zorder=3)
ax2.set_ylim(0, max(vals_c) * 1.25)
ax2.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v/1e6:.1f}M"))
ax2.grid(axis="y", color="#E2E8F0")
ax2.spines["top"].set_visible(False)
ax2.spines["right"].set_visible(False)
ax2.spines["left"].set_visible(False)
for bar, val in zip(bars2, vals_c):
    ax2.text(bar.get_x()+bar.get_width()/2, bar.get_height()+max(vals_c)*0.02,
             f"{val:,}", ha="center", fontsize=10, fontweight="bold")

plt.tight_layout()
save(fig, "10_enrollment_concentration.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 11 — Language: Course Supply vs. Avg Enrollment (opportunity gap)
# ═══════════════════════════════════════════════════════════════════════════════
lang_enroll = collections.defaultdict(int)
lang_cnt    = collections.defaultdict(int)
for r in rows:
    e = int(r["recent_enrollment_count"])
    for l in r["language"].split("; "):
        if l:
            lang_enroll[l] += e
            lang_cnt[l]    += 1

top_langs = sorted(lang_enroll.items(), key=lambda x: x[1], reverse=True)[:10]
l_names  = [l for l, _ in top_langs]
l_counts = [lang_cnt[l] for l in l_names]
l_avgs   = [lang_enroll[l] / lang_cnt[l] for l in l_names]

x = np.arange(len(l_names))
fig, ax1 = plt.subplots(figsize=(12, 5))
fig.suptitle("Language Coverage: Courses Offered vs. Learner Engagement", x=0.05, ha="left",
             fontsize=15, fontweight="bold", y=1.01)
ax1.set_title("Bar = number of courses per language  •  Line = avg enrollments per course",
              fontsize=10, color="#64748B", loc="left", pad=6)

ax2 = ax1.twinx()
ax2.spines["right"].set_visible(True)
ax2.spines["top"].set_visible(False)
ax1.spines["left"].set_visible(False)

bars = ax1.bar(x, l_counts, color=ACCENT, width=0.55, zorder=3)
ax2.plot(x, l_avgs, color=ACCENT3, marker="o", linewidth=2.5, markersize=7, zorder=4)

ax1.set_xticks(x)
ax1.set_xticklabels(l_names, rotation=20, ha="right")
ax1.set_ylabel("Number of Courses", color=ACCENT)
ax2.set_ylabel("Avg Enrollments per Course", color=ACCENT3)
ax1.tick_params(axis="y", colors=ACCENT)
ax2.tick_params(axis="y", colors=ACCENT3)
ax1.grid(axis="y", color="#E2E8F0")
ax2.grid(False)

for bar, val in zip(bars, l_counts):
    ax1.text(bar.get_x()+bar.get_width()/2, bar.get_height()+30, f"{val:,}",
             ha="center", va="bottom", fontsize=9, color=ACCENT)
for xi, val in zip(x, l_avgs):
    ax2.text(xi, val + max(l_avgs)*0.04, f"{val:,.0f}",
             ha="center", va="bottom", fontsize=9, color=ACCENT3)

lines = [plt.Line2D([0],[0],color=ACCENT,lw=6,label="# Courses"),
         plt.Line2D([0],[0],color=ACCENT3,marker="o",lw=2,label="Avg Enrollments")]
ax1.legend(handles=lines, loc="upper right")
save(fig, "11_language_supply_vs_demand.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 12 — Availability Status: Course Count & Avg Enrollment
# ═══════════════════════════════════════════════════════════════════════════════
avail_cnt   = collections.Counter()
avail_enrol = collections.defaultdict(int)
for r in rows:
    e = int(r["recent_enrollment_count"])
    for a in r["availability"].split("; "):
        if a:
            avail_cnt[a]   += 1
            avail_enrol[a] += e

avail_order  = ["Current", "Upcoming", "Archived"]
av_cnt   = [avail_cnt[a]   for a in avail_order]
av_enr   = [avail_enrol[a] for a in avail_order]
av_avg   = [avail_enrol[a]/avail_cnt[a] for a in avail_order]

x = np.arange(3)
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle("Course Availability: Status vs. Learner Demand", x=0.02, ha="left",
             fontsize=15, fontweight="bold", y=1.02)

ax = axes[0]
ax.set_facecolor(BG)
ax.set_title("Number of Courses by Status", fontsize=11, fontweight="bold", loc="left")
cols_av = [ACCENT2, ACCENT3, GRAY]
bars = ax.bar(avail_order, av_cnt, color=cols_av, width=0.5, zorder=3)
ax.set_ylim(0, max(av_cnt)*1.25)
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v,_: f"{v:,.0f}"))
ax.grid(axis="y", color="#E2E8F0")
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.spines["left"].set_visible(False)
for bar, val in zip(bars, av_cnt):
    ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+30, f"{val:,}",
            ha="center", fontsize=11, fontweight="bold")

ax = axes[1]
ax.set_facecolor(BG)
ax.set_title("Avg Enrollment per Course by Status", fontsize=11, fontweight="bold", loc="left")
bars2 = ax.bar(avail_order, av_avg, color=cols_av, width=0.5, zorder=3)
ax.set_ylim(0, max(av_avg)*1.3)
ax.grid(axis="y", color="#E2E8F0")
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.spines["left"].set_visible(False)
for bar, val in zip(bars2, av_avg):
    ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+10, f"{val:,.0f}",
            ha="center", fontsize=11, fontweight="bold")

plt.tight_layout()
save(fig, "12_availability_status.png")


# ═══════════════════════════════════════════════════════════════════════════════
# CHART 13 — Enrollment Distribution (long-tail)
# ═══════════════════════════════════════════════════════════════════════════════
enr_all = sorted([int(r["recent_enrollment_count"]) for r in rows])
bins = [0, 10, 50, 100, 250, 500, 1000, 5000, 10000, 300000]
bin_labels = ["0–10", "11–50", "51–100", "101–250", "251–500",
              "501–1K", "1K–5K", "5K–10K", "10K+"]
bin_counts = [0] * len(bin_labels)
for e in enr_all:
    for i, (lo, hi) in enumerate(zip(bins, bins[1:])):
        if lo <= e < hi:
            bin_counts[i] += 1
            break

fig, ax = plt.subplots(figsize=(11, 5))
fig.suptitle("Enrollment Distribution Across All Courses", x=0.05, ha="left",
             fontsize=15, fontweight="bold", y=1.01)
ax.set_title("Number of courses in each enrollment bracket — highlights the long-tail problem",
             fontsize=10, color="#64748B", loc="left", pad=6)

colors_bc = [GRAY if v < 500 else ACCENT for v in bin_counts]
bars = ax.bar(bin_labels, bin_counts, color=colors_bc, width=0.7, zorder=3)
ax.set_xlabel("Recent Enrollment Range")
ax.set_ylabel("Number of Courses")
ax.grid(axis="y", color="#E2E8F0")
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.spines["left"].set_visible(False)
for bar, val in zip(bars, bin_counts):
    ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+15, f"{val:,}",
            ha="center", va="bottom", fontsize=9)

pct_under100 = sum(bin_counts[:3]) / len(enr_all) * 100
ax.text(0.98, 0.95, f"{pct_under100:.0f}% of courses\nhave < 100 enrollments",
        transform=ax.transAxes, ha="right", va="top",
        fontsize=11, color="#EF4444", fontweight="bold",
        bbox=dict(boxstyle="round,pad=0.4", facecolor="#FEF2F2", edgecolor="#EF4444", linewidth=1.2))
save(fig, "13_enrollment_distribution.png")

print("\nAll 13 charts generated successfully.")
