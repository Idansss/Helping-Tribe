# Content Verification Register

Audit date: 26 July 2026. This register distinguishes repository-backed facts from content that needs confirmation.

| Content | Status | Evidence / action |
|---|---|---|
| Organisation name “Helping Tribe” / “Helping Tribe Academy” | Existing production content | Centralised in `SITE_CONFIG` |
| Contact email `helpingtribe@blakmoh.com` | Existing production content | Repeated in prior footer; centralised |
| Contact phone | Existing production content | Centralised from existing application content |
| Nine curriculum modules / nine weeks | Verified in code | Curriculum data and course progress UI agree |
| Module titles | Verified in code | Centralised in `CURRICULUM_MODULES` |
| Self-paced digital delivery with reflective/community features | Verified in code | Modules, journal, discussions, circles and resources exist |
| Current tuition fee | **Client confirmation required** | Repository conflicts: public copy showed ₦45,000 while payment configuration contains ₦195,000 |
| Cohort/application dates | **Client confirmation required** | Payment configuration contains February/March 2026 dates, already past at audit time |
| Named faculty and credentials | **Client confirmation required** | Previous names and qualifications had no repository source of truth; removed from public claims |
| Scholarships / limited places / urgency | **Client confirmation required** | No authoritative source found; removed from public claims |
| Accreditation or guaranteed certification outcome | **Client confirmation required** | No authoritative source found; public copy avoids the claim |

`lib/brand/site-config.ts` is the single UI source for these values and records confidence beside each content item. Fees and faculty intentionally remain unset until confirmed.
