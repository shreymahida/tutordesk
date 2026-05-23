# Ontario Grade 9-12 Tutoring Market Research Report

Prepared for: TutorDesk / TutorHQ build planning
Date: May 2026
Geography: Ontario, Canada (primary focus: GTA + Ontario at large)

---

## EXECUTIVE TAKEAWAYS (read this first)

1. **The single most valuable course in the Ontario high school math sequence is MCR3U (Grade 11 Functions)**. Weak performance here cascades into MHF4U and MCV4U and effectively closes off STEM university pathways. If your app does only one thing well, build the MCR3U → MHF4U → MCV4U pipeline.
2. **Grade 9 math (MTH1W) is in crisis**. Only **28% of Grade 9 students met the provincial standard in 2023-24** under de-streaming, recovering to ~58% in 2024-25 by EQAO's framing — the de-streaming transition has created a massive remedial tutoring market for Grade 9 + early Grade 10 that did not exist 5 years ago. ([EQAO 2024-25 results](https://finance.yahoo.com/news/eqao-releases-assessment-results-2024-140000394.html))
3. **Ontario tutoring is a $5.36B-growth opportunity nationally (2025-2029)** at ~10% CAGR, with STEM driving most of the spend. ([Technavio](https://www.prnewswire.com/news-releases/private-tutoring-market-in-canada-to-grow-by-usd-5-36-billion-from-2025-2029--focus-on-stem-education-fuels-growth-report-on-how-ai-is-driving-market-transformation---technavio-302367837.html))
4. **The dominant pricing band in Ontario for 1-on-1 high school tutoring is $50-$100/hour**, with certified teachers commanding $75-100+, university student tutors at $40-60, and "boutique" studios like The Math Guru at $85/hr.
5. **Jensen Math (jensenmath.ca) is the single most important free resource** in the Ontario high school math universe — every serious Ontario tutor either uses it or competes with it. Your app must either deep-link to it or build something comparable.
6. **OSSLT and EQAO Grade 9 Math are mandatory, high-stakes, Ontario-specific assessments** that no national/American competitor (Khan Academy, Mathnasium) properly serves. This is your moat.

---

## PART 1 — Ontario Grade 9-12 Curriculum & Tutoring Demand

### Ontario course code legend
The 4th character = grade (1=Gr9, 2=Gr10, 3=Gr11, 4=Gr12). The 5th character = stream: **U** = University prep, **M** = University/College, **C** = College prep, **D** = Academic (Gr 9-10 legacy), **P** = Applied (legacy), **O** = Open, **W** = De-streamed, **E** = Workplace. ([dcp.edu.gov.on.ca](https://www.dcp.edu.gov.on.ca/en/course-descriptions-and-prerequisites/mathematics))

### Grade 9 — The "destreamed crisis" grade

| Subject | Code | Title | Notes |
|---|---|---|---|
| Math | **MTH1W** | Mathematics, Grade 9, De-streamed | Single course for all students since 2021. Covers number sense, algebra, linear relations, measurement, geometry, data/probability, **coding**, **financial literacy**, mathematical modelling. |
| Science | **SNC1W** | Science, Grade 9, De-streamed | Biology, chemistry, physics, earth/space integrated. |
| English | **ENG1D / ENG1P / ENG1L** | English, Grade 9 | Most students take ENG1D (academic). |
| French (Core) | **FSF1D / FSF1P / FSF1O** | Core French |
| French Immersion | **FIF1D** | French Immersion |
| Geography | **CGC1D / CGC1P** | Issues in Canadian Geography |
| Tech / Arts | various | Tech, music, drama, visual arts (open) |

**Highest-demand Grade 9 tutoring**: MTH1W is the #1 by a wide margin. The destreaming reform forced students of widely varying skill into one class, and EQAO Grade 9 Math achievement collapsed — **only 28% met the provincial standard in 2023-24** under destreaming ([EQAO highlights](https://www.eqao.com/wp-content/uploads/2024/09/highlights-provincial-results-2024-g9.pdf)). The 2024-25 rebound to ~58% ([thecanadianpressnews.ca](https://www.thecanadianpressnews.ca/globenewswire_press_releases/eqao-releases-assessment-results-for-2024-2025-school-year/article_99a78109-efca-5ed2-97c3-a0ef3c0c60ba.html)) suggests the system is still finding its footing.

**Pain points**:
- Algebra fluency (variables, manipulation) — students arrive from Grade 8 underprepared
- Linear relations (slope, y-intercept, equation forms) — gatekeeping concept for MPM2D
- Coding strand (Python-style pseudocode) — many teachers don't teach it well
- EQAO Grade 9 Math test (counts 10-30% of final grade in most boards)

### Grade 10 — The "split point" grade

| Subject | Code | Title | Demand notes |
|---|---|---|---|
| Math | **MPM2D** | Principles of Mathematics, Academic | **High demand**. Required for MCR3U. Quadratics, analytic geometry, trigonometry of right + acute triangles, systems of linear equations. |
| Math | **MFM2P** | Foundations of Mathematics, Applied | Lower demand, college-stream. |
| Science | **SNC2D / SNC2P** | Science, Academic / Applied | SNC2D high demand — required for SBI3U/SCH3U/SPH3U. Covers biology (tissue/organ systems), chemistry (atoms/bonding), earth/space, physics (light/optics). |
| English | **ENG2D / ENG2P** | English | OSSLT prep year. |
| Civics + Careers | **CHV2O + GLC2O** | Civics & Citizenship + Careers | Required half-credits. Low tutoring demand. |
| Canadian History | **CHC2D / CHC2P** | Canadian History since WWI | Moderate demand for essay help. |
| Computer Studies | **ICD2O** | Digital Technology & Innovations (Open) | Newer course replacing TIK20. |
| French | **FSF2D / FIF2D** | |
| Business intro | **BBI2O** | Intro to Business (Open) | Open course, low demand. |

**Highest-demand Grade 10 tutoring**: MPM2D (math) and SNC2D (science). MPM2D is the gateway to MCR3U; a B+ in MPM2D often becomes a C in MCR3U if foundations are weak. ([qetutoring.com on MCR3U difficulty](https://www.qetutoring.com/mcr3u-course.html))

**Pain points**:
- Quadratics (factoring, completing the square, quadratic formula, applications)
- Analytic geometry (distance formula, midpoint, equation of a circle)
- Trigonometry — first exposure to sine/cosine laws
- OSSLT (writing in Grade 10, see Part 2)

### Grade 11 — The "make or break" grade

| Subject | Code | Title | Demand notes |
|---|---|---|---|
| Math | **MCR3U** | Functions, University | **MASSIVE demand.** Mandatory prereq for MHF4U & MCV4U. Functions, transformations, rationals, exponentials, trig, discrete (sequences/series, financial math). |
| Math | **MCF3M** | Functions & Applications, U/C | College stream, lighter on theory. |
| Math | **MBF3C** | Foundations for College Math | College stream. |
| Biology | **SBI3U** | Biology, University | High demand. Diversity of living things, evolution, genetics, animal anatomy, plants. |
| Chemistry | **SCH3U** | Chemistry, University | High demand. Matter/chemical bonding, reactions, quantities/stoichiometry, solutions/solubility, gases. |
| Physics | **SPH3U** | Physics, University | High demand. Kinematics, forces, energy/work, waves/sound, electricity/magnetism. |
| English | **ENG3U** | English, University | |
| French | **FSF3U / FIF3U** | |
| Computer Sci | **ICS3U** | Intro to Computer Science (Python/Java) | Growing demand. |
| Business | **BAF3M** | Financial Accounting Fundamentals | |
| Business | **BBB4M precursor** | International Business |
| Social Sci | **HSP3U** | Intro to Anthropology, Psychology, Sociology | Moderate demand. |

**Highest-demand Grade 11 tutoring**: **MCR3U is the single most-tutored course in Ontario high school**. Quote from industry: "A weak MCR3U foundation guarantees struggle in Grade 12." ([go2gradtutors.com](https://www.go2gradtutors.com/post/grade-11-functions-exam-prep-ontario-last-minute-study-guide-for-mcr3u-success)). SBI3U/SCH3U/SPH3U are right behind.

**Pain points**:
- Function notation and transformations
- Inverse functions
- Trigonometric identities (first real exposure)
- Logarithms (introduced at end of year)
- For SCH3U: stoichiometry, mole calculations, limiting reagents
- For SPH3U: vector decomposition, free-body diagrams, projectile motion

### Grade 12 — The "university admission" grade

| Subject | Code | Title | Demand notes |
|---|---|---|---|
| Math | **MHF4U** | Advanced Functions | **#1 demand.** Required for almost every STEM-adjacent university program at U of T, Waterloo, McMaster, Western, Queen's. Polynomial, rational, logarithmic, trigonometric functions; combining functions; rates of change. |
| Math | **MCV4U** | Calculus & Vectors | **Highest difficulty in OSSD.** Required for engineering, physics, math, comp sci at all top Ontario universities. MHF4U is concurrent or prior prereq. Limits, derivatives, applications, vectors, lines/planes in 3D. |
| Math | **MDM4U** | Data Management | Required/preferred for business, social science, humanities, and many life sciences. Probability, statistics, one-variable + two-variable analysis, culminating project. |
| Biology | **SBI4U** | Biology | Required for life sciences, kinesiology, nursing, pre-med pathway. Biochemistry, metabolism, molecular genetics, homeostasis, population/community dynamics. |
| Chemistry | **SCH4U** | Chemistry | Required for engineering, life sci, nursing, pharmacy. Organic chem, structure/properties, energy changes/rates, equilibrium, electrochemistry. |
| Physics | **SPH4U** | Physics | Required for engineering, physics, often comp sci. Dynamics, energy/momentum, gravitational/electric/magnetic fields, wave nature of light, modern physics. |
| English | **ENG4U** | English, University | **Universally required.** Min grade is admission gatekeeper. |
| French | **FSF4U / FIF4U** | |
| Comp Sci | **ICS4U** | Computer Science | Object-oriented programming, software engineering principles, data structures. |
| Business | **BAT4M** | Financial Accounting Principles | |
| Business | **BBB4M** | International Business |
| Social Sci | **HSB4U** | Challenge & Change in Society |

**University requirement summary** (verified at [Waterloo Eng](https://uwaterloo.ca/engineering/future-students/applying/admission-requirements), [U of T Eng](https://engineering.calendar.utoronto.ca/admission-requirements), [U of T Life Sci](https://www.artsci.utoronto.ca/future/ready-apply/admission-requirements/ontario-high-school)):

| Program type | Required Grade 12 U courses |
|---|---|
| Engineering (all Ontario universities) | ENG4U, MHF4U, **MCV4U**, **SCH4U**, **SPH4U** + 1 |
| Life Sciences / Pre-Med pathway | ENG4U, MHF4U, **SBI4U**, **SCH4U** (+SPH4U often) |
| Computer Science (Waterloo CS, U of T CS) | ENG4U, MHF4U, **MCV4U** (Waterloo), often SPH4U |
| Business (Ivey AEO, Rotman, Schulich) | ENG4U, MHF4U or MDM4U, often **MCV4U** for Rotman |
| Nursing | ENG4U, MHF4U, **SCH4U**, **SBI4U** |
| Kinesiology | ENG4U, **SBI4U** (or SCH4U), MHF4U |
| Humanities / Social Sci | ENG4U, MHF4U or MDM4U + breadth |

**Pain points by course**:
- **MHF4U**: log/exponential equations, trig identities (sum/difference, double angle), polynomial division, rates of change as conceptual bridge to calc
- **MCV4U**: derivative rules + chain rule, curve sketching, related rates, optimization, vector operations, 3D lines/planes intersections — **the course universally rated hardest in OSSD math**
- **MDM4U**: combinatorics (permutations/combinations), conditional probability, normal distribution, the culminating ISU (independent study)
- **SCH4U**: organic chemistry naming + reactions, equilibrium ICE tables, redox/electrochem cells
- **SPH4U**: rotational dynamics, momentum in 2D, EM fields, modern physics (relativity, quantum)

### Highest-leverage subjects — the must-offer list

In ranked order, these are the courses where a tutoring business in Ontario **must** have curriculum, materials, and qualified tutors:

| Rank | Course | Why |
|---|---|---|
| 1 | **MCV4U** Calculus & Vectors | Hardest course, highest fail/retake rate, every STEM university requires it. Premium pricing supported. |
| 2 | **MHF4U** Advanced Functions | Universally required prerequisite to MCV4U and most STEM programs. |
| 3 | **MCR3U** Functions | Foundation for both above. If a student fails MCR3U, STEM is closed. |
| 4 | **SCH4U** Chemistry | Engineering, nursing, life sci gatekeeper. |
| 5 | **SPH4U** Physics | Engineering, comp sci gatekeeper. |
| 6 | **SBI4U** Biology | Life sci, pre-med, kinesiology, nursing gatekeeper. |
| 7 | **ENG4U** English | Universally required, lower per-hour rate but high volume. |
| 8 | **MPM2D** Gr 10 Academic Math | Gateway to MCR3U. |
| 9 | **MDM4U** Data Management | Business + arts admission requirement. |
| 10 | **MTH1W** Grade 9 De-streamed Math | Largest volume by population (every Gr 9 student). |

---

## PART 2 — University Prep & Test Prep Demand

### Ontario university admission landscape

**The fundamental fact**: Ontario universities admit on Grade 12 marks alone for local OUAC 101 applicants — **no SAT, no ACT required** for the vast majority of programs. ([IVY Lounge Test Prep](https://www.ivyloungetestprep.com/blog/sat-act-canada), [Sparkl](https://sparkl.me/blog/sat/sat-requirements-for-canadian-universities-a-student-parent-guide-to-toronto-mcgill-ubc-and-beyond/))

**Exceptions where SAT/ACT matters in Ontario**:
- McGill (out-of-province, often required)
- Western Ivey AEO (HBA) program (supplemental application + sometimes test scores)
- US applicants to Waterloo Engineering
- Students cross-applying to US schools
- Some international applicants

**Implication for TutorHQ**: SAT/ACT prep is a niche, not mainstream demand. Don't build for it as a primary offering. There's a small, premium market (rich families wanting US options) but it's <5% of the Ontario tutoring market.

### OUAC application timeline (Grade 12) — critical for app integration

From [OUAC 2026-2027 Schedule](https://guidance.ouac.on.ca/resources/schedule-of-dates/):

| Date | Event |
|---|---|
| Early September | OUAC opens for Ontario Grade 12 students |
| **Jan 15** | **Equal-consideration deadline for OUAC 101** (Ontario HS students) |
| Feb 12 | Deadline for Ontario HS to report midterm/interim 4U/M grades to OUAC |
| April | Universities send first-round offers |
| **May 28** | Latest date applicants receive a response from Ontario universities |
| **June 1** | Earliest date universities require accept-by + deposit |
| Mid-July | Final marks transmitted to universities |

### Course-by-course university requirement matrix

**MHF4U (Advanced Functions)** — required by:
- All engineering programs (Waterloo, U of T, McMaster, Queen's, Western, Guelph, OCAD-adjacent)
- All CS programs at U-15 universities
- Most life sciences / health sci programs (U of T Life Sci, McMaster Health Sci, Western Med Sci)
- Most business programs (Rotman, Ivey HBA/AEO, Schulich, Queen's Commerce, Smith)
- Many actuarial / financial math programs

**MCV4U (Calculus & Vectors)** — required by:
- All engineering programs at Ontario universities
- Waterloo CS (Math Faculty requires it; also Mathematical Optimization, Pure Math, etc.)
- U of T Engineering, Computer Science specialist programs
- Physics / Math majors at U of T, Waterloo, McMaster, Queen's
- McGill engineering for Ontario applicants
- Often required for Rotman Commerce admission averages
- Western Ivey AEO recommends it

**MDM4U (Data Management)** — accepted/required:
- Required for many business admin / business management programs at U of T Scarborough, U of T Mississauga, York
- Accepted in place of MCV4U for many humanities, social sciences, life sciences (but **not** for engineering or CS)
- Used by McMaster Health Sciences (any 12 4U math)
- Western Ivey AEO (any math)

**SCH4U (Chemistry)** — required by:
- All engineering (Waterloo, U of T, all engineering programs)
- Nursing (McMaster, Western, U of T)
- Pharmacy (U of T, Waterloo)
- Life sciences (all U-15)
- Medical sciences

**SPH4U (Physics)** — required by:
- All engineering
- Physics, astronomy
- Often CS (Waterloo CS recommends, U of T CS requires for some streams)
- Optometry (Waterloo)

**SBI4U (Biology)** — required by:
- Life sciences (all U-15)
- Nursing
- Kinesiology
- Health sciences (McMaster Health Sci, U of T Life Sci)
- Pre-med pathway (effectively required even when "recommended")

### IB and AP demand in Ontario

**AP** is widely available in Ontario:
- ~25 pre-AP / AP courses at Loretto Abbey CSS, Father Henry Carr, UTS, and many TDSB/YRDSB schools ([TCDSB AP](https://www.tcdsb.org/programsservices/schoolprogramsk12/ap/Pages/default.aspx), [YRDSB AP](https://www2.yrdsb.ca/schools-programs/school-programs-nav/school-programs/advanced-placement-ap))
- Most-taken AP courses by Ontario students: AP Calculus AB/BC, AP Statistics, AP Chemistry, AP Biology, AP Physics 1/C, AP English Lit/Lang, AP Computer Science A, AP Psychology
- **Demand for AP tutoring** is meaningful but concentrated in specific schools and ambitious families targeting US schools or scholarship/credit advantage at Canadian universities

**IB**: Each year more Ontario students apply to IB programs ([York Region Tutoring](https://www.yorkregiontutoring.com/ontario-grade-9-ib-program-admission-test/)). IB Diploma students consistently underperform their predicted grades versus regular OSSD path, fueling tutoring demand. Toronto has dedicated IB tutoring agencies (IB Tutors Toronto, Hack Your Course, IB Tutoring Academy). **HL Math (AA + AI), HL Chemistry, HL Biology, and ToK/Extended Essay** are the highest-demand IB tutoring services.

**SAT/ACT**: Niche. Mathnasium and Princeton Review run programs but it's secondary.

### Specialty admission tests in Ontario

- **U of T Engineering**: Online Student Profile / Video Interview (no test, but supplemental matters)
- **Waterloo Engineering**: AIF (Admission Information Form) + video interview
- **Western Ivey AEO**: supplemental application essays
- **McMaster Health Sciences**: supplemental application (renowned for being competitive — coaching market exists)
- **McMaster B.H.Sc. supplementary essays**: there's a niche supplementary essay tutoring market
- **CASPer test**: for some health programs (Mac Health Sci, some U of T health programs) — coaching/practice market

### Engineering & Med school prereqs (the highest-stakes pathway)

For Ontario undergrad engineering: ENG4U + MHF4U + **MCV4U + SCH4U + SPH4U** + one elective, with 70%+ in each (Waterloo requires 70%, but real admit averages are mid-90s). ([Waterloo Eng](https://uwaterloo.ca/engineering/future-students/applying/admission-requirements))

For pre-med (no direct admit in Ontario except Mac Health Sci, Queen's Health Sci, Western Med Sci, U of T Life Sci as feeders): same high-90s averages, with SBI4U + SCH4U + MHF4U as the backbone. MCAT prep is a separate market that happens at the undergraduate level.

---

## PART 3 — Resource Providers (Free & Paid)

### Math resources

| Provider | What it offers | Pricing | Quality (1-10) | Downloadable? | Tutor-legal use? |
|---|---|---|---|---|---|
| **Jensen Math** ([jensenmath.ca](https://www.jensenmath.ca/)) | Full unit-by-unit notes, worksheets w/ answers, video lessons for MTH1W, MPM2D, MCR3U, MHF4U, MCV4U, MDM4U. Ontario-curriculum-specific. | **FREE** | **10/10 for Ontario** | PDF download | Yes — explicitly meant for student/teacher use. **Best free Ontario math resource bar none.** |
| **TVO Mathify** ([mathify.tvolearn.com](https://mathify.tvolearn.com/)) | 1:1 free online tutoring w/ Ontario Certified Teachers, Mon-Fri 9am-9pm + Sat-Sun 3pm-9pm. Grades 4-11. | **FREE** | 8/10 | No (live tutoring) | Free — but is a competitor, not a resource to embed |
| **CEMC Courseware** (University of Waterloo) ([cemc.uwaterloo.ca](https://cemc.uwaterloo.ca/resources/courseware)) | Online lessons + interactive activities + enrichment for Grades 7-12 math + comp sci. Past Euclid, Fermat, Cayley contests with solutions. | **FREE** | 9/10 | Linkable, embeddable | Yes (educational use). Past contests are gold for enrichment students. |
| **Khan Academy** ([khanacademy.org](https://www.khanacademy.org/)) | Algebra 1/2, Geometry, Trig, Precalculus, AP Calc, AP Stats. Not Ontario-aligned. | **FREE** | 9/10 (US-aligned), 6/10 (Ontario alignment) | Linkable, no API | Yes |
| **OpenStax** ([openstax.org](https://openstax.org/)) | Free college/AP textbooks (College Algebra, Calculus 1-3, Statistics). Not high-school-Ontario but useful for MCV4U → first-year supplement. | **FREE** | 8/10 | PDF download, CC-BY license | Yes — CC-licensed, can be redistributed |
| **CK-12 Foundation** ([ck12.org](https://ck12.org)) | "Flexbooks" + practice in math, sci. Adaptive practice with AI tutor. | Free | 7/10 | Linkable | Yes |
| **Math Is Fun** ([mathsisfun.com](https://www.mathsisfun.com)) | Explainers + interactives, K-12. | Free | 7/10 | Linkable | Yes |
| **Mathway / Photomath / Symbolab** | Equation solvers. Mathway free for basic; $9.99/mo for steps. | Freemium | 7/10 | API exists (Symbolab/Wolfram) | Tutor use OK as a teaching aid |
| **Wolfram Alpha** | Computational answers + step-by-step. | $7.25/mo Pro | 9/10 | API ($) | Yes |
| **StudyPug** ([studypug.com/curriculum/ca/on/math/grade12/](https://www.studypug.com/curriculum/ca/on/math/grade12/)) | Ontario-curriculum-aligned video lessons by course code. | $39.99/mo | 7/10 | Streaming only | Yes (with subscription) |
| **AllThingsMathematics** (Patrick Maracle) | Full MCR3U/MHF4U/MCV4U courses on Udemy/own platform. | $50-$100 one-time per course | 8/10 | Streaming | Yes |

**Best free Ontario math source overall: Jensen Math.** Builds every TutorHQ-style "resource library" link should go to Jensen first.

### Science resources

| Provider | What | Pricing | Quality | Notes |
|---|---|---|---|---|
| **The Organic Chemistry Tutor** (YouTube) | 8M+ subs. Algebra → calculus, gen chem, organic chem, physics 1+2. Worked examples. | Free | 10/10 for worked problems | Embed-friendly. SCH4U/SPH4U students lean on this heavily. |
| **CrashCourse** (Hank Green) | Biology, Chemistry, Physics, Anatomy & Physiology, Organic Chemistry. ~17M subs. | Free | 9/10 for conceptual | Linkable. Great for SBI4U topics. |
| **Bozeman Science** (Paul Andersen) | AP Bio/Chem/Physics + NGSS science. | Free | 9/10 | Conceptually deep. |
| **Khan Academy Science** | AP Bio, Chem, Physics 1/2; high school biology, chemistry, physics. | Free | 8/10 | Practice questions tied to videos. |
| **OpenStax Science** | Bio for AP, Chemistry, Physics (all free PDFs, CC-licensed). | Free | 8/10 | Tutor-legal redistribute. |
| **CK-12 Science** | Flexbooks for bio/chem/physics. | Free | 7/10 | |
| **PhET Simulations** (U of Colorado) | Free interactive physics, chem, bio simulations. | Free | 10/10 for interactivity | Embed in lessons. Indispensable for SPH3U/SPH4U. |

### English / writing resources

| Provider | What | Pricing | Notes |
|---|---|---|---|
| **SparkNotes, LitCharts, CliffsNotes** | Study guides for ENG3U/4U novels and plays | Free / $9.95/mo (LitCharts) | LitCharts is highest quality |
| **Purdue OWL** | Citation + grammar | Free | Gold standard for MLA |
| **Grammarly** | Writing tool | Free / $12/mo | Useful for ENG students |

### OSSLT prep resources

| Provider | What | Pricing | Notes |
|---|---|---|---|
| **EQAO Sample Tests** ([eqao.com](https://www.eqao.com/the-assessments/osslt/)) | Official released questions & practice tests | **Free** | Must-use. Pass mark = 75% / level 3. |
| **TDSB OSSLT Prep** ([TDSB resources](https://schoolweb.tdsb.on.ca/northviewheights/Students/Resources/OSSLT-Preparation-Resources)) | Board-published prep | Free | |
| **Canada eSchool, Virtual HS** | Prep modules | Paid course | |

### EQAO Grade 9 Math prep

- **EQAO Released Questions** ([eqao.com/math-resource-released-questions-g9-24](https://www.eqao.com/math-resource-released-questions-g9-24/)) — official past items, free
- **Jensen Math MTH1W unit** — covers full curriculum
- **TVO Mathify** — free 1:1

### Ontario-specific & government resources

| Provider | What | Status (May 2026) |
|---|---|---|
| **Curriculum and Resources (CRS)** ([dcp.edu.gov.on.ca](https://www.dcp.edu.gov.on.ca/)) | Official Ontario curriculum docs, course descriptions, prerequisites. **Authoritative source for course codes.** | Active. **Must integrate.** |
| **EduGAINS** ([edugains.ca](http://www.edugains.ca/)) | Legacy ministry resource library | **Discontinued / legacy** since 2021-2024 migration to CRS |
| **OERB (Ontario Educational Resource Bank)** ([resources.elearningontario.ca](https://resources.elearningontario.ca/)) | 32,000+ K-12 resources by teachers for teachers | Active, but **gated** — only board-affiliated educators can access |
| **Onted.ca** ([onted.ca/topics/edugains](https://www.onted.ca/topics/edugains)) | Community-reposted EduGAINS legacy content | Active, free |
| **Trillium List** ([ontario.ca/page/trillium-list](https://www.ontario.ca/page/trillium-list)) | Ministry-approved textbooks list | Active |

### Textbook publishers — what's free?

- **Nelson Education** (acquired McGraw-Hill Ryerson K-12): student online learning centre exists ([learningcentre.nelson.com/student](https://learningcentre.nelson.com/student/index.html)) but most content requires an access code from a purchased textbook. Free chapter samplers exist.
- **Pearson Canada**: minimal free, mostly login-gated.
- **Internet Archive**: hosts older editions of Nelson Math, Nelson Chemistry 11, etc. ([archive.org](https://archive.org/details/chem11)) — legally grey for redistribution but findable.
- **Practical reality**: Most Ontario students pirate or share PDF textbooks via Google Drive folders shared on Reddit. Your app should NOT host these, but can link to legitimate Trillium-approved publisher pages.

### Reddit & community

- **r/OntarioGrade12s** — active community sharing resources, study tips, university admission threads
- **r/OntarioUniversities** — admission-focused
- **r/UofT, r/uwaterloo, r/McMaster, r/queensuniversity, r/uwo** — feeder discussions
- **r/HighschoolCanada** — broader
- These are gold mines for understanding student pain points; competitors don't have a presence there because they look like marketing. A non-spammy, helpful TutorHQ presence is a wedge.

### What tutors can legally use in lessons

- Jensen Math, Khan Academy, OpenStax, CEMC, PhET, EQAO past questions, government-published curriculum docs: **all free for tutor use**
- Textbook PDFs from publishers without an institutional license: **copyright restricted**, do not host or distribute
- YouTube embeds (OrganicChem Tutor, CrashCourse, Bozeman, Khan Academy): **always OK to link/embed**
- Worksheets created by other tutoring services (Spirit of Math, Kumon proprietary): **copyrighted**, do not redistribute

### Best-in-class by content type

| Need | Best free | Best paid |
|---|---|---|
| Worksheets w/ solutions (math) | **Jensen Math** | Teachers Pay Teachers ($3-15/item) |
| Video lessons (math) | **Jensen Math** + Organic Chemistry Tutor | StudyPug, AllThingsMathematics |
| Video lessons (science) | **The Organic Chemistry Tutor**, CrashCourse, Bozeman Science | StudyPug |
| Practice tests (math) | CEMC past contests, EQAO Grade 9 math | StudyPug, USCA Academy |
| Practice tests (OSSLT) | **EQAO released tests** | TDSB-published packs |
| Formula sheets | Jensen Math unit headers, Nelson textbook appendices | — |
| Solution keys | Jensen Math, Slader (now Quizlet, restricted) | Chegg ($14.95/mo), Course Hero |

---

## PART 4 — Top Ontario Tutoring Services Landscape

### Big chains / franchises

#### Oxford Learning
- **Service model**: After-school learning centres, 3:1 student-to-teacher ratio, also small groups (≤8-10), monthly programs not per-hour
- **Pricing**: ~**$500-$700/month** (historical, 2022 data) — varies by location. Open Mon-Thu 4-8pm, Sat AM. ([oxfordlearning.com/pricing](https://oxfordlearning.com/pricing/))
- **USP**: "Cognitive learning" branded methodology, K-12 + university prep, owns Toronto/GTA brand recognition
- **Marketing**: SEO-heavy; per-city landing pages; partners with realtors and schools; "free assessment" lead funnel
- **Weakness for us**: opaque pricing, lock-in monthly contracts, low Ontario-curriculum-specific public content

#### Kumon Canada
- **Service model**: Worksheet-based, 2x/week in-centre + daily homework, K-12, **Math** + **Reading** as separate programs
- **Pricing**: **$100-$200/month per subject** after $680 first-month (registration + deposit + materials) ([tutors.com](https://tutors.com/costs/kumon-cost), [myengineeringbuddy.com](https://www.myengineeringbuddy.com/blog/kumon-reviews-alternatives-pricing-offerings/)). 30-day cancellation rule.
- **USP**: Daily practice routine, self-paced ladder of worksheets, parent peace of mind
- **Marketing**: Heavy franchise/local presence; "math facts confidence" messaging; ESL families
- **Weakness for us**: Not Ontario-curriculum-aligned, not high-school-focused (drops off in difficulty), not individualized instruction

#### Mathnasium
- **Service model**: Subscription-based, drop-in 2-3x/week, "Mathnasium Method," ages 4-18
- **Pricing**: **$250-$400/month CAD** in Canada; $25-$75 per session equivalent ([tutors.com/costs/mathnasium-cost](https://tutors.com/costs/mathnasium-cost)). GTA: locations in Toronto (Pleasant View, Forest Hill, Lakeview), Mississauga, Meadowvale. ([mathnasium.ca/ontario](https://www.mathnasium.ca/ontario?state=ON))
- **USP**: Proprietary diagnostic + custom learning plan, "math-only" specialist brand, kid-friendly centre vibe
- **Marketing**: Local franchise model; SAT/ACT prep upsell for older students; "math anxiety" parent messaging
- **Weakness for us**: Limited high school depth, US-curriculum DNA

#### Sylvan Learning
- **Service model**: K-12, math + reading + writing + STEM, in-centre + online (Sylvan Sync)
- **Pricing**: ~$40-$100/hr private, ~$290/month for groups ([sylvanlearning.com/how-sylvan-works/pricing](https://www.sylvanlearning.com/how-sylvan-works/pricing/))
- **USP**: 3:1 ratio, diagnostic assessment, certified teacher tutors
- **Weakness for us**: Generic North American curriculum, expensive perception

#### Spirit of Math
- **Service model**: After-school **enrichment** (not remedial) for high-achieving K-Gr 11 students, weekly classes (~2 hrs/wk), problem-solving + contest math
- **Locations**: Central Toronto, Forest Hill, High Park + others; expanded across Canada
- **USP**: Pipelines kids to math contests (Gauss, Pascal, Euclid, AMC). Free trial class. Strong reputation among gifted/IB families. ([spiritofmath.com](https://spiritofmath.com/))
- **Marketing**: Word of mouth, contest results, alumni success stories, Asian-Canadian family networks
- **Weakness for us**: Not for struggling students; very specific niche

### Boutique / GTA specialists

#### The Math Guru (Toronto, Yonge & Eglinton)
- **Service model**: Boutique math + science studio, in-person + online, 1:1 + small group, exam parties, summer programs, OSSD course credits
- **Pricing**: **$85/hour** ([themathguru.ca](https://www.themathguru.ca/))
- **USP**: Founder Vanessa Vakharia is a media brand (Math Therapy podcast, book deal); confidence-building + math-positive identity messaging; appeals to teen girls especially; "we don't need degrees, we need teachers who love teaching"
- **Marketing**: Personal brand, podcast, Instagram, Toronto Life-style press, "anti-tutor" positioning
- **Lesson for TutorHQ**: Brand voice and student emotional state matter as much as math content

#### TutorOne (Ontario online + in-home)
- **Pricing**: $42-$60/hour depending on hours/week. Free AI tutoring included. Family discounts. ([tutorone.ca](https://tutorone.ca/ontario/))
- **USP**: Free AI tutoring, biweekly written feedback to parents, last-minute exam help, low-income family pricing
- **Marketing**: Aggressive SEO + content blog, "parent reporting" angle, broad K-12 + LSAT/SAT
- **Lesson**: AI tutor + parent reporting is becoming table stakes

#### Prep Academy Tutors (Toronto/GTA + multi-province)
- **Service model**: In-home + online, all certified teachers (their hard requirement)
- **Locations**: Midtown, North, Downtown East, West Toronto, Mississauga/Milton, York Region, Kitchener-Waterloo + Ottawa + Westchester ([prepacademytutors.com](https://prepacademytutors.com/))
- **USP**: "All tutors are certified teachers," Singapore Math + JUMP Math methodology for younger kids, premium positioning
- **Marketing**: Per-region landing pages, parent testimonials, "certified teacher" trust signal

#### Olympiads School (formerly), now **Meritus Academy**
- **Service model**: Chinese-Canadian-rooted academic enrichment school; AP courses, math contest prep, OSSD credits, hands-on STEM
- **Locations**: Markham, Richmond Hill, Toronto
- **USP**: Strong contest math results (CEMC, AMC, AIME), Chinese-speaking parent community, IB/AP coverage

#### Olympiad Tutoring Academy (separate; Masoud Darouian, PhD)
- 1:1 / small group, math + chem + physics, high school + university, GTA + online ([olympiadtutor.wordpress.com](https://olympiadtutor.wordpress.com/))

#### Spongy Brain (not strongly verifiable as a single Ontario brand)
- No clearly identifiable Ontario-incorporated business by this exact name surfaced. May be a small local operator. Not a market mover.

#### Pasha Math (not verifiable in current Ontario market)
- Did not surface as an active Toronto/Ontario tutoring brand in current search. May be small or rebranded.

### York Region / Mississauga / Ottawa locals (representative)

- **York Region Tutoring** ([yorkregiontutoring.com](https://www.yorkregiontutoring.com/)) — strong SEO for course-code-specific landing pages (SPH4U summer camp, MCR3U learn-ahead). Smart playbook.
- **QE Tutoring** ([qetutoring.com](https://www.qetutoring.com/mcr3u-course.html)) — full MCR3U/MCV4U courses
- **Success Tutorial School**, **Brainstorm Academy**, **Canadian Grad Academy**, **USCA Academy** — all offer course-code-specific OSSD courses
- **Learning Tree Tutors** ([learningtreetutors.com](https://learningtreetutors.com/tutoring-costs/)) — online + in-home

### Common SEO / marketing tactics across the top players

1. **Per-course-code landing pages** (MCV4U, MHF4U, MCR3U each get their own page) — biggest single SEO move
2. **"Learn ahead this summer" / "exam crammer" seasonal campaigns**
3. **Free assessment / diagnostic** as top-funnel offer
4. **Certified teacher trust signal**
5. **Parent testimonials with university acceptance results** ("Got into Waterloo Eng")
6. **Per-region landing pages** for Toronto, Mississauga, York Region, etc.
7. **Free worksheets / blog posts** for SEO (Jensen Math model)
8. **Local Google Business listings + reviews** dominance
9. **Realtor + school partnerships**
10. **Instagram + TikTok** for the boutique studios (Math Guru playbook)

### What's genuinely valuable from the top players (lessons for TutorHQ)

- **Spirit of Math**: Curriculum-as-product; sequenced multi-year journey, not just sessions
- **Mathnasium**: Diagnostic-first, learning-plan model with subscription pricing
- **Oxford Learning**: Multi-subject bundle (not just math), monthly retainer
- **Kumon**: Daily-practice habit + worksheets-shipped-home model
- **The Math Guru**: Brand personality + confidence/identity work
- **Prep Academy**: Certified-teacher trust signal
- **TutorOne**: AI tutor add-on + parent reporting + low-income tier
- **CEMC, Jensen Math**: Authoritative free content as marketing moat
- **York Region Tutoring**: Course-code SEO playbook
- **Spongy Brain (and others)**: small, hyper-local, owner-operator models — typical TutorDesk customer profile

---

## PART 5 — Pricing Benchmarks (Ontario, 2025-2026)

### Per-hour 1-on-1 tutoring rates

| Tutor type | Rate range (CAD/hour) | Source / context |
|---|---|---|
| University student tutor (general) | **$25–$40** | Superprof tutors start $15/hr ([superprof.ca](https://www.superprof.ca/lessons/mathematics/toronto/)); avg ~$30 |
| University student tutor (top school, strong subject) | $40–$60 | Quora discussions, Tutorlyft |
| Recent grad / non-certified pro | $50–$70 | Tutorlyft, TutorOne |
| Certified Ontario teacher (OCT) | **$70–$100** | Superprof Ontario guide ([superprof.ca/blog/tips-on-how-much-to-charge](https://www.superprof.ca/blog/tips-on-how-much-to-charge/)); Prep Academy positioning |
| Boutique studio rate | $80–$100 | Math Guru $85/hr; QE Tutoring; Mathnasium private |
| Specialist (AP/IB/SAT) | $80–$150 | IB Tutors Toronto, hackyourcourse |
| Agency markup (charged to parent) | $50–$90 | TutorOne $42-60; Tutorax, Learning Tree |
| What tutor takes home (after agency cut) | 50-70% of above | Industry norm; Indeed Oxford salaries $20-25/hr |

Source mix: [Tutorlyft Toronto guide](https://www.tutorlyft.com/blogs/how-much-does-a-math-tutor-cost-per-hour-in-toronto), [TutorOne 2025 cost breakdown](https://tutorone.ca/breaking-down-the-cost-of-private-tutoring-in-canada/), [Learning Tree Tutors](https://learningtreetutors.com/tutoring-costs/), [Tutoring With a Twist](https://tutoringwithatwist.ca/ns/how-much-does-a-tutor-cost-in-canada/).

### Pricing by grade / subject

| Grade / subject | Typical hourly rate (CAD) |
|---|---|
| Grades 1-8 general | $30-$50 |
| Grade 9-10 math/science | $40-$70 |
| Grade 11-12 math/science (esp MCR3U, MHF4U, MCV4U, SCH4U, SPH4U) | **$55-$100** |
| Grade 12 English (ENG4U) | $40-$70 |
| IB HL / AP | $70-$150 |
| SAT/ACT prep | $75-$200 |

### Online vs in-person

- **Online**: typically $5-15 lower per hour than in-person for the same tutor
- **In-person travel premium**: tutors charge $5-20 more or build in a travel minimum (often 90 min minimum)
- Online tutoring grew sharply post-pandemic and is now the default for high school subject tutoring

### Group vs 1-on-1

- 1-on-1: full price (see table)
- Small group (2-4): often $30-50/hr **per student**, tutor earning higher hourly net
- Larger group (8-10 like Oxford small groups): $20-30/hr per student
- Spirit of Math / Kumon / Mathnasium: subscription, effectively $25-40 per "session" cost-equivalent

### Subscription / package models

| Provider | Approx monthly cost (CAD) |
|---|---|
| Kumon (per subject) | $100-$200 + $680 onboarding |
| Mathnasium | $250-$400 |
| Oxford Learning | $500-$700 (multi-session) |
| Sylvan Learning | $290+ (in US dollars near parity for Canada locations) |
| Spirit of Math | ~$200-$280 (estimated; centres don't publish) |
| Private tutor (4 sessions/mo @ $70/hr) | $280 |
| Private tutor (8 sessions/mo @ $70/hr) | $560 |

### Test/exam prep packages

- OSSLT prep packages: $200-$500 for 5-10 sessions
- SAT/ACT bootcamps: $1,500-$4,000 for 20-40 hours
- Final exam crammer (MCV4U/MHF4U): $300-$600 for a weekend intensive

### What drives premium pricing (commands +25-50%)

1. OCT (Ontario Certified Teacher) credential
2. Specialization in Grade 12 U-stream courses (MCV4U especially)
3. IB / AP credentials
4. Track record of admits to Waterloo/U of T/McGill engineering / med-pathway
5. Toronto downtown/Yorkville/Forest Hill location for in-person
6. "Boutique brand" recognition (Math Guru)

### Tutor wage reality (the supply side TutorHQ serves)

- An Ontario university student tutor charging $50/hour direct to families nets $50/hour
- The same tutor going through an agency (Oxford, TutorOne, Prep Academy) takes home $20-30/hour as the agency charges parents $60-80
- **This delta is a huge driver of independent tutors / small-business tutors who would use TutorDesk to go direct**

---

## PART 6 — Build Recommendations for TutorHQ

### Top 5 subjects to optimize the app around

Rank-ordered by combined demand, premium pricing potential, and competitive moat:

1. **MCV4U (Grade 12 Calculus & Vectors)** — premium pricing, highest difficulty, every STEM university requires it. Build the deepest curriculum tracking, AI explainer for derivatives/vectors, worksheet library, formula sheets, and "exam crammer" templates here first.
2. **MHF4U (Grade 12 Advanced Functions)** — universally required, paired with MCV4U.
3. **MCR3U (Grade 11 Functions)** — the foundation domino. Win here and tutors will keep students for two more years.
4. **SCH4U (Grade 12 Chemistry)** + **SPH4U (Grade 12 Physics)** — engineering / nursing / life sci gatekeepers.
5. **MTH1W (Grade 9 De-streamed Math)** — largest student population, lowest provincial standard achievement, EQAO-graded. High volume, recurring revenue.

Secondary tier to support but not optimize first: SBI4U, MDM4U, MPM2D, ENG4U, ICS3U/4U, AP/IB add-ons.

### Specific course codes to build curriculum tracking around

The app's "subject" entity should be the **Ontario course code** as a first-class object, not a generic "Math 12". Build curriculum tracking around:

**Math sequence (priority)**: MTH1W → MPM2D / MFM2P → MCR3U / MCF3M → MHF4U + MCV4U + MDM4U

**Science sequence**: SNC1W → SNC2D → SBI3U + SCH3U + SPH3U → SBI4U + SCH4U + SPH4U

**English sequence**: ENG1D → ENG2D → ENG3U → ENG4U (+ OSSLT in Grade 10)

**Other supported**: ICS3U/4U, ICD2O, FSF/FIF 1D-4U, BAF3M/BAT4M, CHV2O, CHC2D, HSP3U, HSB4U

Each course in the app should have:
- Unit structure matching Ontario curriculum
- Pre-loaded learning goals from [dcp.edu.gov.on.ca](https://www.dcp.edu.gov.on.ca/)
- Common pain-point tags
- Mapped prerequisites
- Mapped university programs that require it

### Resource providers to integrate with / link to / recreate

1. **Jensen Math (jensenmath.ca)** — DEEP integration. Tutors and students should be able to one-click pull a Jensen worksheet for any MTH1W/MPM2D/MCR3U/MHF4U/MCV4U/MDM4U unit. **This is your #1 partnership.** Reach out to Jenson directly for white-label / referral arrangement.
2. **CEMC (cemc.uwaterloo.ca)** — Past contests, courseware, problem-of-the-week. Integration via deep links + scrape-permissible content.
3. **EQAO (eqao.com)** — Released questions and practice tests for Grade 9 Math + OSSLT. Free, official, must-have.
4. **PhET simulations (phet.colorado.edu)** — Embed in science lessons for SNC/SBI/SCH/SPH courses.
5. **The Organic Chemistry Tutor + CrashCourse + Khan Academy** — embed YouTube videos against specific lesson topics. (No partnership needed, just smart linking.)
6. **OUAC / OUInfo (ouinfo.ca)** — university program requirement data for the "where am I trying to go" feature.

Don't try to recreate Jensen Math. Compete on workflow integration around it.

### Three "wedge" features that win against Oxford Learning's tools, Teachworks, TutorBird

1. **Ontario Course Code as a first-class object with curriculum + university mapping**. No competitor does this. When a parent says "my kid is taking MCR3U," the tutor's session, lesson plan, resources, and reporting all snap to that course. The app knows MCR3U is the prereq for MHF4U/MCV4U which are required for Waterloo Eng. Show that pathway to the parent. None of TutorBird, Teachworks, TutorBird, Wise, or Yo!Coach have any of this — they're curriculum-agnostic SaaS. (Sources: [Capterra tutoring software](https://www.capterra.ca/directory/30849/tutoring/software), [Wise tutor management](https://www.wise.live/blog/best-tutor-management-software-tutoring/).)

2. **AI session planner trained on Ontario curriculum + Jensen Math style**. Tutor inputs: "Grade 11 MCR3U student, struggling with inverse functions, exam in 2 weeks." App outputs: lesson plan with concept review → Jensen Math worksheet link → 5 practice problems sequenced from easy to hard → 1 application problem from a past Ontario exam → diagnostic 3-question quiz. Generic AI tutoring assistants (TutorOne's free AI, Khanmigo) don't know the Ontario curriculum granularly.

3. **EQAO + OSSLT + OUAC mode**: built-in dashboards that flag the high-stakes moments:
   - "Your Grade 9 student writes EQAO Math the week of X — here are the released question banks"
   - "Your Grade 10 student writes the OSSLT on March 26 — practice plan ready"
   - "Your Grade 12 student's OUAC deadline is Jan 15 — current trajectory: MHF4U at 78% will not meet Waterloo Eng 90+ admit average; targeted intervention plan: [plan]"

   Bonus wedge: **post-secondary admit calculator** showing competitive average vs current marks for U of T, Waterloo, McMaster, Western, Queen's by program.

### Other strong feature ideas, Ontario-specific

- **OCT (Ontario Certified Teacher) verification badge** on tutor profiles — directly addresses Prep Academy's positioning
- **Parent biweekly progress report** automation — TutorOne does this manually, automate it
- **Course-code-based marketplace SEO** — every TutorDesk-powered tutor gets auto-generated landing pages like /mcv4u-tutor-toronto, /mhf4u-tutor-mississauga, copying the York Region Tutoring playbook but at scale
- **Group-session billing + roster management** — half the small operators (Spongy Brain types) run small groups, generic SaaS handles this poorly
- **Resource library** scoped to Ontario curriculum, free + open content, deduplicated and tagged by course code + unit
- **Calendar integration with semester turns**: Ontario semester schools restart Feb / Sept; the app should know
- **Tax-deductible expense reporting** for tutors (CRA self-employed schedule)
- **Bilingual French immersion mode** for FIF tutors and Franco-Ontarian families — underserved
- **Integration with school board grading windows** (TDSB, YRDSB, PDSB) — most tutors are flying blind on when marks are reported

### Pricing/positioning recommendation for the app itself (separate from tutor pricing)

Based on competitive software (Teachworks, TutorBird ~$15-50/mo for solo tutors; ~$100-300/mo for centres), TutorHQ should price:

- **Solo tutor tier**: $20-30 CAD/mo flat — undercut TutorBird and bundle the Ontario curriculum
- **Small-business tier (5-25 tutors)**: $100-200/mo + per-tutor add-on
- **Centre/franchise tier**: $300-600/mo with multi-location + admin roles
- Optional **AI sessions** add-on: $10-20/mo per tutor for AI planning + AI student tutor

### Three-month roadmap suggestion

**Month 1**: Course code data model + curriculum import for MTH1W, MPM2D, MCR3U, MHF4U, MCV4U, MDM4U, SBI/SCH/SPH 3U/4U, ENG4U. Pre-seed pain-point tags.

**Month 2**: Resource library (Jensen Math deep-link integration, CEMC, EQAO, PhET, YouTube channel curation). University-program requirement matrix.

**Month 3**: AI lesson planner v1 + EQAO/OSSLT/OUAC dashboards. Begin marketing to independent tutors via /mcv4u-tutor-{city} landing pages.

---

## SOURCES

### Curriculum & ministry
- [Ontario Curriculum and Resources (CRS)](https://www.dcp.edu.gov.on.ca/)
- [Ontario Math 9-10 (2005, applicable units)](https://www.edu.gov.on.ca/eng/curriculum/secondary/math910curr.pdf)
- [Ontario Math 11-12 (revised)](https://www.edu.gov.on.ca/eng/curriculum/secondary/math1112currb.pdf)
- [Ontario Science 11-12 (2008 revised)](https://www.edu.gov.on.ca/eng/curriculum/secondary/2009science11_12.pdf)
- [Ontario Science 9-10 (2008 revised)](https://www.edu.gov.on.ca/eng/curriculum/secondary/science910_2008.pdf)
- [Ontario Computer Studies 10-12 (2008 revised)](https://www.edu.gov.on.ca/eng/curriculum/secondary/computer10to12_2008.pdf)
- [Ontario FSL 9-12 (2014)](https://www.edu.gov.on.ca/eng/curriculum/secondary/fsl912curr2014.pdf)
- [Ontario Business 11-12](https://www.edu.gov.on.ca/eng/curriculum/secondary/business1112currb.pdf)
- [Ontario Canadian & World Studies 9-10 (revised)](https://www.edu.gov.on.ca/eng/curriculum/secondary/canworld910curr2013.pdf)
- [MTH1W de-streamed course - Ontario](https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w)
- [Trillium List - approved textbooks](https://www.ontario.ca/page/trillium-list)

### Assessment & test data
- [EQAO Grade 9 Math](https://www.eqao.com/the-assessments/grade-9-math/)
- [EQAO 2024-25 results announcement (Yahoo Finance)](https://finance.yahoo.com/news/eqao-releases-assessment-results-2024-140000394.html)
- [EQAO 2024 highlights PDF](https://www.eqao.com/wp-content/uploads/2024/09/highlights-provincial-results-2024-g9.pdf)
- [EQAO released questions Grade 9 2024](https://www.eqao.com/math-resource-released-questions-g9-24/)
- [EQAO OSSLT](https://www.eqao.com/the-assessments/osslt/)
- [TDSB OSSLT Prep Resources](https://schoolweb.tdsb.on.ca/northviewheights/Students/Resources/OSSLT-Preparation-Resources)

### University requirements
- [University of Waterloo Engineering admission](https://uwaterloo.ca/engineering/future-students/applying/admission-requirements)
- [University of Toronto Engineering admission](https://engineering.calendar.utoronto.ca/admission-requirements)
- [University of Toronto Arts & Sci admission](https://www.artsci.utoronto.ca/future/ready-apply/admission-requirements/ontario-high-school)
- [UBC Canadian secondary applicants](https://vancouver.calendar.ubc.ca/admissions/applicants-following-canadian-secondary-school-curriculum)
- [OUAC 2026-2027 Schedule of Dates](https://guidance.ouac.on.ca/resources/schedule-of-dates/)
- [OUAC Application Deadlines](https://www.ouac.on.ca/planning/deadlines/)
- [Courses commonly required for Ontario university admissions (OVS)](https://www.ontariovirtualschool.ca/courses-commonly-required-for-undergraduate-university-admissions/)

### Test prep
- [SAT/ACT for Canadian universities (Ivy Lounge)](https://www.ivyloungetestprep.com/blog/sat-act-canada)
- [SAT requirements at Canadian universities (Sparkl)](https://sparkl.me/blog/sat/sat-requirements-for-canadian-universities-a-student-parent-guide-to-toronto-mcgill-ubc-and-beyond/)
- [AP at UTS](https://www.utschools.ca/the-uts-difference/academics/ap-program)
- [TCDSB AP Program](https://www.tcdsb.org/programsservices/schoolprogramsk12/ap/Pages/default.aspx)
- [YRDSB AP](https://www2.yrdsb.ca/schools-programs/school-programs-nav/school-programs/advanced-placement-ap)

### Resource providers
- [Jensen Math](https://www.jensenmath.ca/) (with MCR3U, MPM2D, MHF4U, MCV4U, MDM4U pages)
- [CEMC University of Waterloo](https://cemc.uwaterloo.ca/) + [Courseware](https://cemc.uwaterloo.ca/resources/courseware) + [Past contests](https://cemc.uwaterloo.ca/resources/past-contests)
- [TVO Learn Mathify](https://mathify.tvolearn.com/)
- [Khan Academy](https://www.khanacademy.org/)
- [The Organic Chemistry Tutor (YouTube)](https://www.youtube.com/channel/UCEWpbFLzoYGPfuWUMFPSaoA)
- [CrashCourse (YouTube)](https://www.youtube.com/user/crashcourse)
- [OERB login (gated)](https://resources.elearningontario.ca/)
- [Onted.ca (EduGAINS legacy)](https://www.onted.ca/topics/edugains)
- [Nelson Student Online Learning Centre](https://learningcentre.nelson.com/student/index.html)

### Tutoring services & pricing
- [Oxford Learning pricing](https://oxfordlearning.com/pricing/)
- [Kumon Canada cost guide](https://tutors.com/costs/kumon-cost)
- [Kumon reviews & pricing 2026](https://www.myengineeringbuddy.com/blog/kumon-reviews-alternatives-pricing-offerings/)
- [Mathnasium Canada Ontario](https://www.mathnasium.ca/ontario?state=ON) + [pricing](https://tutors.com/costs/mathnasium-cost)
- [Sylvan Learning pricing](https://www.sylvanlearning.com/how-sylvan-works/pricing/)
- [Spirit of Math](https://spiritofmath.com/)
- [The Math Guru](https://www.themathguru.ca/)
- [Prep Academy Tutors](https://prepacademytutors.com/)
- [TutorOne Ontario](https://tutorone.ca/ontario/)
- [TutorOne 2025 cost breakdown](https://tutorone.ca/breaking-down-the-cost-of-private-tutoring-in-canada/)
- [York Region Tutoring](https://www.yorkregiontutoring.com/)
- [QE Tutoring MCR3U](https://www.qetutoring.com/mcr3u-course.html)
- [Tutorlyft Toronto rates](https://www.tutorlyft.com/blogs/how-much-does-a-math-tutor-cost-per-hour-in-toronto)
- [Tutorlyft Canada rates 2026](https://www.tutorlyft.com/blogs/how-much-does-a-tutor-cost-per-hour-in-canada)
- [Learning Tree Tutors Toronto](https://learningtreetutors.com/tutoring-costs/)
- [Superprof Ontario rate guide](https://www.superprof.ca/blog/tips-on-how-much-to-charge/)

### Industry context
- [Technavio Canada private tutoring market 2025-2029](https://www.prnewswire.com/news-releases/private-tutoring-market-in-canada-to-grow-by-usd-5-36-billion-from-2025-2029--focus-on-stem-education-fuels-growth-report-on-how-ai-is-driving-market-transformation---technavio-302367837.html)
- [Globe & Mail on tutoring demand](https://www.theglobeandmail.com/investing/personal-finance/household-finances/article-parents-budget-for-tutoring-to-fill-in-gaps-in-childrens-education/)
- [Capterra Canada tutoring software](https://www.capterra.ca/directory/30849/tutoring/software)
- [Wise best tutor management software](https://www.wise.live/blog/best-tutor-management-software-tutoring/)

---

**Report end.** Recommendation if you build one thing this quarter: the **Ontario course-code-aware curriculum data model + Jensen Math resource integration + EQAO/OSSLT/OUAC dashboards**. That trio is the wedge no national tutoring SaaS or US-curriculum chain can replicate, and it's exactly what an Ontario tutoring business owner has been begging for.
