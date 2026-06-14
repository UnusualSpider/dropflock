package db

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"backend/internal/models"
)

// MaybeSeed inserts the canonical hardcoded data into an empty database.
// Re-running on an already-populated database is a no-op: each seed step
// short-circuits if the relevant table has any rows.
func (p *Pool) MaybeSeed(ctx context.Context) error {
	if err := p.seedStats(ctx); err != nil {
		return fmt.Errorf("seed stats: %w", err)
	}
	if err := p.seedIssues(ctx); err != nil {
		return fmt.Errorf("seed issues: %w", err)
	}
	if err := p.seedSecurityIncidents(ctx); err != nil {
		return fmt.Errorf("seed security_incidents: %w", err)
	}
	if err := p.seedSecurityFindings(ctx); err != nil {
		return fmt.Errorf("seed security_findings: %w", err)
	}
	if err := p.seedGroups(ctx); err != nil {
		return fmt.Errorf("seed groups: %w", err)
	}
	if err := p.seedTalkingPoints(ctx); err != nil {
		return fmt.Errorf("seed talking_points: %w", err)
	}
	if err := p.seedReps(ctx); err != nil {
		return fmt.Errorf("seed reps: %w", err)
	}
	return nil
}

// emptyTable returns true if the named table has zero rows.
func (p *Pool) emptyTable(ctx context.Context, table string) (bool, error) {
	var n int
	row := p.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM %s", table))
	if err := row.Scan(&n); err != nil {
		return false, err
	}
	return n == 0, nil
}

// ── stats ────────────────────────────────────────────────────────────────────

func (p *Pool) seedStats(ctx context.Context) error {
	empty, err := p.emptyTable(ctx, "stats")
	if err != nil || !empty {
		return err
	}
	rows := []models.StatInput{
		{Key: "home.cities",       Value: "5,000+", Label: "Cities with FLOCK",   Emphasis: "normal", Source: "flocksafety.com/about", SortOrder: 1},
		{Key: "home.plate_reads",  Value: "4B+",    Label: "Plate reads logged",  Emphasis: "normal", Source: "flocksafety.com/about", SortOrder: 2},
		{Key: "home.opt_out",      Value: "0",      Label: "Ways to opt out",     Emphasis: "red",   Source: "", SortOrder: 3},
		{Key: "act.contracts",     Value: "30+",    Label: "Contracts canceled",  Emphasis: "normal", SortOrder: 1},
		{Key: "act.cities",        Value: "23+",    Label: "Cities since Feb 2025", Emphasis: "normal", SortOrder: 2},
		{Key: "act.skills",        Value: "0",      Label: "Special skills required", Emphasis: "red", SortOrder: 3},
		{Key: "security.findings", Value: "51",     Label: "Total findings",      Emphasis: "red",   Source: "gainsec.com", SortOrder: 1},
		{Key: "security.cves",     Value: "22+",    Label: "CVEs assigned",       Emphasis: "red",   Source: "MITRE", SortOrder: 2},
		{Key: "security.devices",  Value: "3",      Label: "Devices fully rooted", Emphasis: "red",  Source: "gainsec.com", SortOrder: 3},
		{Key: "security.cameras",  Value: "60+",    Label: "Cameras exposed publicly", Emphasis: "red", Source: "404 Media", SortOrder: 4},
	}
	for _, r := range rows {
		_, err := p.Exec(ctx, `
			INSERT INTO stats (key, value, label, source, emphasis, sort_order)
			VALUES ($1, $2, $3, NULLIF($4, ''), $5, $6)
		`, r.Key, r.Value, r.Label, r.Source, r.Emphasis, r.SortOrder)
		if err != nil {
			return err
		}
	}
	return nil
}

// ── issues ───────────────────────────────────────────────────────────────────

func (p *Pool) seedIssues(ctx context.Context) error {
	empty, err := p.emptyTable(ctx, "issues")
	if err != nil || !empty {
		return err
	}
	rows := []models.IssueInput{
		{
			Slug:    "mass-surveillance",
			Tag:     "Mass Surveillance",
			Title:   "Blanket tracking of innocent people",
			Summary: "FLOCK cameras don't target suspects — they log every vehicle that passes by, creating a de facto record of where law-abiding citizens travel, when, and how often.",
			Body: `FLOCK's own marketing celebrates the scale: billions of plate reads, every day, across 5,000+ cities. The system doesn't require a crime to trigger a scan. Simply driving past a camera — near a clinic, a place of worship, a political rally, or a therapist's office — adds a timestamped record to a database that persists for months or years.

Courts have long held that isolated location data isn't a search. But the Supreme Court's Carpenter v. United States (2018) recognized that long-term, aggregated location tracking is different: it creates a "detailed chronicle of a person's physical presence" that implicates the Fourth Amendment. FLOCK's network does exactly that — at scale, automatically, and with no suspicion required.`,
			Sources: []models.Source{
				{Label: "Carpenter v. United States (2018)", Href: "https://www.oyez.org/cases/2017/16-402"},
				{Label: "FLOCK Safety — About", Href: "https://www.flocksafety.com/about"},
			},
			SortOrder: 1,
		},
		{
			Slug:    "data-sharing",
			Tag:     "Data Sharing",
			Title:   "2,000+ agencies share your data — no warrant needed",
			Summary: "When your plate is logged, it doesn't stay local. FLOCK's \"Falcon\" network lets any participating agency query any other agency's data — with no judicial oversight.",
			Body: `FLOCK operates a cross-agency data-sharing network called Falcon. A single plate read in your hometown can be queried by a police department in another state. Agencies sign up to share data as a condition of joining the network — meaning the geographic footprint of surveillance is far larger than the cameras in your city alone.

There is no standardized warrant or court-order requirement to run a query. Individual agencies set their own policies — and many have none at all. Investigative reporting by outlets including Wired and the Electronic Frontier Foundation has found that this creates a nationwide surveillance dragnet with virtually no judicial checks.`,
			Sources: []models.Source{
				{Label: "EFF — License Plate Readers", Href: "https://www.eff.org/issues/license-plates"},
				{Label: "Wired — FLOCK's data network", Href: "https://www.wired.com/tag/license-plate-readers/"},
			},
			SortOrder: 2,
		},
		{
			Slug:    "no-opt-out",
			Tag:     "No Opt-Out",
			Title:   "Zero ways to remove yourself from the database",
			Summary: "There is no national opt-out registry, no deletion request process, and no right to know if your plate has been queried — in most states.",
			Body: `Unlike consumer data companies that must respond to deletion requests under laws like CCPA, law-enforcement-adjacent surveillance vendors like FLOCK operate in a nearly unregulated space. Only a handful of states have enacted ALPR-specific data governance laws, and even fewer give individuals the right to access or delete their own records.

If you drive past a FLOCK camera, your data is collected. If an agency queries your plate, you will almost certainly never know. If you want that data deleted, you have no mechanism to demand it in most jurisdictions. You are not a customer; you are the product.`,
			Sources: []models.Source{
				{Label: "ACLU — License Plate Readers FAQ", Href: "https://www.aclu.org/issues/privacy-technology/surveillance-technologies/license-plate-readers"},
			},
			SortOrder: 3,
		},
		{
			Slug:    "chilling-effects",
			Tag:     "Chilling Effects",
			Title:   "Surveillance changes behavior — even when you've done nothing wrong",
			Summary: "Knowing you are watched changes how freely people move, associate, and exercise their rights. That chilling effect is itself a harm.",
			Body: `Research consistently shows that awareness of surveillance reduces participation in lawful activities: people visit religious sites less, attend protests less, and seek medical or mental health care less when they know their movements are being tracked. This is the chilling effect — surveillance doesn't need to result in an arrest to suppress freedom.

For FLOCK's network, the chilling effect is structural. Because data is retained and shared across agencies, anyone who drives near a protest, an immigration office, a reproductive health clinic, or a political event should reasonably expect that trip to be logged — potentially indefinitely. The mere existence of the network has a deterrent effect on constitutionally protected activity.`,
			Sources: []models.Source{
				{Label: "PEN America — Chilling Effects", Href: "https://pen.org/report/chilling-effects/"},
				{Label: "NYU Law — Surveillance & Civil Liberties", Href: "https://www.law.nyu.edu/centers/ili"},
			},
			SortOrder: 4,
		},
		{
			Slug:    "security",
			Tag:     "Security",
			Title:   "Admin panels exposed to the public internet",
			Summary: "FLOCK camera admin interfaces have been found accessible without authentication — putting sensitive law-enforcement data at risk.",
			Body: `Security researchers have identified FLOCK camera management interfaces reachable from the open internet, some without meaningful authentication controls. These interfaces can expose live camera feeds, stored plate reads, and configuration data.

This is not a theoretical risk. Any sufficiently motivated actor — a stalker, a foreign intelligence service, a domestic extremist — could potentially access location data on specific vehicles or individuals if these exposures are not patched. The sensitivity of ALPR data makes this a high-severity concern, yet FLOCK's contracts with municipalities rarely include binding security SLAs or mandatory disclosure of breaches.`,
			Sources: []models.Source{
				{Label: "See our Security page", Href: "/security"},
			},
			SortOrder: 5,
		},
		{
			Slug:    "accountability",
			Tag:     "Accountability",
			Title:   "Contracts approved with no public debate",
			Summary: "Many cities have signed multi-year FLOCK contracts through administrative channels — bypassing city council votes and public comment periods.",
			Body: `FLOCK has grown explosively in part because it sells to police departments and city managers who can approve contracts without a full council vote, often under spending thresholds that trigger public notice. Residents frequently learn their city has joined the FLOCK network only after the fact — if at all.

This procurement model sidelines democratic accountability. There is no public debate about data retention periods, sharing agreements, or use policies before cameras go up. When advocates later seek records through FOIA requests, they routinely find that contracts include broad confidentiality provisions that obscure the terms of the deal.`,
			Sources: []models.Source{
				{Label: "Brennan Center — Police Tech Procurement", Href: "https://www.brennancenter.org/our-work/research-reports/hidden-cameras-hidden-contracts"},
			},
			SortOrder: 6,
		},
	}
	for _, r := range rows {
		sources, err := json.Marshal(r.Sources)
		if err != nil {
			return err
		}
		_, err = p.Exec(ctx, `
			INSERT INTO issues (slug, title, body, category, tag, summary, sources, sort_order)
			VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
		`, r.Slug, r.Title, r.Body, r.Tag, r.Tag, r.Summary, string(sources), r.SortOrder)
		if err != nil {
			return err
		}
	}
	return nil
}

// ── security_incidents (timeline) ────────────────────────────────────────────

type seedIncident struct {
	Date        string
	Title       string
	Description string
	FlockDenied bool
	SortOrder   int
}

func (p *Pool) seedSecurityIncidents(ctx context.Context) error {
	empty, err := p.emptyTable(ctx, "security_incidents")
	if err != nil || !empty {
		return err
	}
	rows := []seedIncident{
		{"2025-02-08", "GainSec makes initial contact with Flock Safety to report findings.", "GainSec makes initial contact with Flock Safety to report findings.", false, 1},
		{"2025-02-10", "Flock Safety responds to initial disclosure.", "Flock Safety responds to initial disclosure.", false, 2},
		{"2025-03-07", "Flock Safety submits CVE requests to MITRE for 10 of the vulnerabilities.", "Flock Safety submits CVE requests to MITRE for 10 of the vulnerabilities.", false, 3},
		{"2025-05-05", "Flock Safety publishes a customer advisory about the gunshot detection and LPR findings — the first public acknowledgment.", "Flock Safety publishes a customer advisory about the gunshot detection and LPR findings — the first public acknowledgment.", false, 4},
		{"2025-06-19", "GainSec publicly discloses findings: root shell on the Falcon/Sparrow LPR and debug shell on the Raven gunshot detection system.", "GainSec publicly discloses findings: root shell on the Falcon/Sparrow LPR and debug shell on the Raven gunshot detection system.", false, 5},
		{"2025-06-27", "First batch of CVEs published. GainSec discloses further vulnerabilities to Flock.", "First batch of CVEs published. GainSec discloses further vulnerabilities to Flock.", false, 6},
		{"2025-09-19", "GainSec discloses root shell on the Bravo Compute Box (Device 3).", "GainSec discloses root shell on the Bravo Compute Box (Device 3).", false, 7},
		{"2025-09-27", "GainSec discloses wireless RCE, live camera feed access, DoS, and information disclosure vulnerabilities in the Falcon/Sparrow.", "GainSec discloses wireless RCE, live camera feed access, DoS, and information disclosure vulnerabilities in the Falcon/Sparrow.", false, 8},
		{"2025-11-05", "GainSec publishes formal white paper: \"Examining the Security Posture of an Anti-Crime Ecosystem\" — 51 findings, 22 assigned CVEs, 8 more pending.", "GainSec publishes formal white paper: \"Examining the Security Posture of an Anti-Crime Ecosystem\" — 51 findings, 22 assigned CVEs, 8 more pending.", false, 9},
		{"2025-11-06", "Flock Safety publishes a blog post responding to the white paper, claiming \"none of the vulnerabilities have an impact on customers' ability to carry out their public safety objectives.\"", "Flock Safety publishes a blog post responding to the white paper, claiming \"none of the vulnerabilities have an impact on customers' ability to carry out their public safety objectives.\"", true, 10},
		{"2025-11-16", "Benn Jordan publishes \"We Hacked Flock Safety Cameras in Under 30 Seconds\" on YouTube, demonstrating six of the most critical findings to a mass audience.", "Benn Jordan publishes \"We Hacked Flock Safety Cameras in Under 30 Seconds\" on YouTube, demonstrating six of the most critical findings to a mass audience.", false, 11},
		{"2025-12-01", "404 Media investigation, corroborated by Jordan and GainSec, reveals at least 60 Flock Condor PTZ cameras streaming live to the open internet with no authentication.", "404 Media investigation, corroborated by Jordan and GainSec, reveals at least 60 Flock Condor PTZ cameras streaming live to the open internet with no authentication.", false, 12},
	}
	for _, r := range rows {
		_, err := p.Exec(ctx, `
			INSERT INTO security_incidents (title, date, description, flock_denied, sort_order)
			VALUES ($1, $2::date, $3, $4, $5)
		`, r.Title, r.Date, r.Description, r.FlockDenied, r.SortOrder)
		if err != nil {
			return err
		}
	}
	return nil
}

// ── security_findings (CVE / vulnerability cards) ────────────────────────────

type seedFinding struct {
	Slug      string
	Severity  string
	Device    string
	Title     string
	Body      string
	Source    string
	SourceURL string
	SortOrder int
}

func (p *Pool) seedSecurityFindings(ctx context.Context) error {
	empty, err := p.emptyTable(ctx, "security_findings")
	if err != nil || !empty {
		return err
	}
	rows := []seedFinding{
		{
			Slug: "CVE-2025-59409", Severity: "CRITICAL", Device: "Falcon/Sparrow LPR",
			Title: "Hardcoded Wi-Fi credentials in production firmware",
			Body: `The Falcon and Sparrow license plate readers ship with development Wi-Fi credentials ("test_flck") stored in cleartext in their production firmware. Anyone within Wi-Fi range of a deployed camera can connect to it using these credentials — no tools required. From there, further exploitation becomes dramatically easier.`,
			Source: "GainSec — CVE-2025-59409",
			SourceURL: "https://gainsec.com/2025/09/27/fly-by-device-2-the-falcon-sparrow-gated-wireless-rce-camera-feed-dos-information-disclosure-and-more/",
			SortOrder: 1,
		},
		{
			Slug: "CVE-2025-59407", Severity: "CRITICAL", Device: "Falcon/Sparrow LPR + Bravo Compute Box",
			Title: "Hardcoded Java Keystore password exposes private keys",
			Body: `The DetectionProcessing Android application (com.flocksafety.android.objects) bundles a Java Keystore file (flock_rye.bks) along with its hardcoded password ("flockhibiki17") directly in the application code. This keystore contains a private key. Any attacker with access to the APK — which can be pulled from a device — can extract the key material.`,
			Source: "GainSec — CVE-2025-59407",
			SourceURL: "https://gainsec.com/2025/09/27/fly-by-device-2-the-falcon-sparrow-gated-wireless-rce-camera-feed-dos-information-disclosure-and-more/",
			SortOrder: 2,
		},
		{
			Slug: "BUTTON-RCE", Severity: "HIGH", Device: "Falcon/Sparrow LPR + Bravo Compute Box",
			Title: "Physical button sequence activates Wi-Fi hotspot with shared password",
			Body: `Pressing a button on the back of the LPR camera fewer than a handful of times activates an onboard Wi-Fi hotspot. That hotspot uses the same hardcoded password across all devices — meaning once you know the password for one camera, you know it for every camera in the fleet. GainSec demonstrated that this sequence can lead to a full wireless remote code execution (RCE) shell.`,
			Source: "GainSec + DeleteMe Podcast Transcript",
			SourceURL: "https://joindeleteme.com/podcast/what-the-hack-flock-safety-privacy-concerns/",
			SortOrder: 3,
		},
		{
			Slug: "CONDOR-EXPOSURE", Severity: "CRITICAL", Device: "Condor PTZ Cameras",
			Title: "Live camera feeds streaming to the open internet — no authentication",
			Body: `At least 60 Flock Condor PTZ cameras were found accessible on the public internet with no authentication whatsoever. Anyone with a browser could view live video feeds, access 30 days of archived footage, and in some cases interact with administrative controls. A 404 Media reporter drove to Bakersfield, California and watched himself in real time on his phone as the camera livestreamed him to the open internet.`,
			Source: "404 Media / PetaPixel / Benn Jordan",
			SourceURL: "https://petapixel.com/2025/12/29/big-brother-left-the-door-open-flocks-ai-surveillance-cameras-exposed-to-the-internet/",
			SortOrder: 4,
		},
		{
			Slug: "ROOT-SHELL", Severity: "HIGH", Device: "Falcon/Sparrow LPR + Raven + Bravo Compute Box",
			Title: "Root shell obtained on all three core device types",
			Body: `GainSec obtained full root shell access on all three major Flock hardware devices: the Raven gunshot detection system, the Falcon/Sparrow LPR camera, and the Bravo Edge AI Compute Box. All devices ran outdated, end-of-life versions of Android with debugging features left enabled in production firmware — a fundamental hardening failure.`,
			Source: "GainSec white paper — gainsec.com",
			SourceURL: "https://github.com/GainSec/anti-crime-ecosystem-research",
			SortOrder: 5,
		},
		{
			Slug: "EOL-OS", Severity: "HIGH", Device: "All Devices",
			Title: "End-of-life Android OS with debugging enabled in production",
			Body: `The Falcon/Sparrow runs Android Things 8.1 — a version that Google discontinued support for, meaning it no longer receives security patches. Debug interfaces were left active in units deployed in the field. These are not minor oversights; they are foundational security failures that compound every other vulnerability on this list.`,
			Source: "GainSec — Part 3 / Security Ledger Podcast",
			SourceURL: "https://securityledger.com/2025/12/ai-surveillance-unmasking-flock-safetys-insecurities/",
			SortOrder: 6,
		},
	}
	for _, r := range rows {
		_, err := p.Exec(ctx, `
			INSERT INTO security_findings (slug, severity, device, title, body, source, source_url, sort_order)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`, r.Slug, r.Severity, r.Device, r.Title, r.Body, r.Source, r.SourceURL, r.SortOrder)
		if err != nil {
			return err
		}
	}
	return nil
}

// ── groups ───────────────────────────────────────────────────────────────────

type seedGroup struct {
	Slug     string
	Name     string
	Scope    string
	Focus    []string
	Location string
	Lat      *float64
	Lng      *float64
	URL      string
	Win      string
	SortOrder int
}

func ptr(f float64) *float64 { return &f }

func (p *Pool) seedGroups(ctx context.Context) error {
	empty, err := p.emptyTable(ctx, "groups")
	if err != nil || !empty {
		return err
	}
	rows := []seedGroup{
		{
			Slug: "eff", Name: "Electronic Frontier Foundation (EFF)", Scope: "National",
			Focus: []string{"Legal", "Research", "Policy"}, Location: "National",
			URL: "https://www.eff.org/issues/license-plates",
			Win: "Sparked state and federal investigations; co-filed ACLU lawsuit against San Jose",
			SortOrder: 1,
		},
		{
			Slug: "aclu", Name: "ACLU", Scope: "National",
			Focus: []string{"Legal", "Policy"}, Location: "National",
			URL: "https://www.aclu.org/issues/privacy-technology/surveillance-technologies/license-plate-readers",
			Win: "Supported unanimous Cambridge council pause; Oregon chapter backed Eugene records lawsuit",
			SortOrder: 2,
		},
		{
			Slug: "fftf", Name: "Fight for the Future", Scope: "National",
			Focus: []string{"Organizing", "Policy"}, Location: "National",
			URL: "https://www.fightforthefuture.org/actions/flockout/",
			Win: "National petition; coordinated campaigns in multiple cities",
			SortOrder: 3,
		},
		{
			Slug: "deflock", Name: "DeFlock / deflock.me", Scope: "National",
			Focus: []string{"Tools", "Research"}, Location: "National",
			URL: "https://deflock.me",
			Win: "Mapped 90,000+ cameras; defeated Flock's C&D with EFF backing",
			SortOrder: 4,
		},
		{
			Slug: "haveibeenflocked", Name: "Have I Been Flocked", Scope: "National",
			Focus: []string{"Tools"}, Location: "National",
			URL: "https://haveibeenflocked.com",
			SortOrder: 5,
		},
		{
			Slug: "alprwatch", Name: "ALPR.watch", Scope: "National",
			Focus: []string{"Tools", "Organizing"}, Location: "National",
			URL: "https://alpr.watch",
			SortOrder: 6,
		},
		{
			Slug: "eyes-off-eugene", Name: "Eyes Off Eugene", Scope: "Local",
			Focus: []string{"Organizing", "Legal"}, Location: "Eugene, OR",
			Lat: ptr(44.0521), Lng: ptr(-123.0868),
			URL: "https://oregoncapitalchronicle.com/2025/10/23/alleging-secrecy-aclu-and-eugene-resident-sue-city-for-flock-camera-records/",
			Win: "Eugene + Springfield both terminated Flock contracts (Dec 2025)",
			SortOrder: 7,
		},
		{
			Slug: "trust-coalition", Name: "TRUST Coalition", Scope: "Local",
			Focus: []string{"Organizing", "Policy"}, Location: "San Diego, CA",
			Lat: ptr(32.7157), Lng: ptr(-117.1611),
			URL: "https://www.eff.org/deeplinks/2025/06/san-diegans-push-back-flock-alpr-surveillance",
			SortOrder: 8,
		},
		{
			Slug: "flock-off-ithaca", Name: "Flock Off Ithaca", Scope: "Local",
			Focus: []string{"Organizing"}, Location: "Ithaca, NY",
			Lat: ptr(42.4440), Lng: ptr(-76.5021),
			URL: "https://newrepublic.com/article/206992/flock-safety-cameras-alpr-deflock-resistance-nationwide",
			SortOrder: 9,
		},
		{
			Slug: "deflock-bcs", Name: "DropFlock BCS", Scope: "Local",
			Focus: []string{"Organizing", "Research"}, Location: "Bryan, TX",
			Lat: ptr(30.6744), Lng: ptr(-96.3698),
			URL: "https://www.deflockbcs.com",
			SortOrder: 10,
		},
		{
			Slug: "digital-fourth", Name: "Digital Fourth", Scope: "Local",
			Focus: []string{"Policy", "Organizing"}, Location: "Cambridge, MA",
			Lat: ptr(42.3736), Lng: ptr(-71.1097),
			URL: "https://www.eff.org/deeplinks/2025/12/local-communities-are-winning-against-alpr-surveillance-heres-how-2025-review",
			Win: "Cambridge city council unanimous pause vote (Oct 2025)",
			SortOrder: 11,
		},
	}
	for _, r := range rows {
		focus, err := json.Marshal(r.Focus)
		if err != nil {
			return err
		}
		_, err = p.Exec(ctx, `
			INSERT INTO groups (slug, name, scope, focus, location, lat, lng, url, win, sort_order, national, state, published)
			VALUES ($1, $2, $3, $4::text[], $5, $6, $7, $8, NULLIF($9, ''), $10, $11, $12, true)
		`,
			r.Slug, r.Name, r.Scope, string(focus), r.Location, r.Lat, r.Lng, r.URL, r.Win, r.SortOrder,
			r.Scope == "National",
			stateOrEmpty(r.Location),
		)
		if err != nil {
			return err
		}
	}
	return nil
}

// stateOrEmpty extracts the trailing 2-letter state from a "City, ST" string.
// Used so the legacy `state` column stays populated for queries that filter on it.
func stateOrEmpty(loc string) string {
	for i := len(loc) - 1; i >= 0; i-- {
		if loc[i] == ',' {
			s := loc[i+1:]
			s = trimSpace(s)
			if len(s) == 2 {
				return s
			}
			return ""
		}
	}
	return ""
}

func trimSpace(s string) string {
	start, end := 0, len(s)
	for start < end && (s[start] == ' ' || s[start] == '\t') {
		start++
	}
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t') {
		end--
	}
	return s[start:end]
}

// ── talking_points ───────────────────────────────────────────────────────────

type seedTalkingPoint struct {
	Title     string
	Body      string
	Category  string
	SortOrder int
}

func (p *Pool) seedTalkingPoints(ctx context.Context) error {
	empty, err := p.emptyTable(ctx, "talking_points")
	if err != nil || !empty {
		return err
	}
	rows := []seedTalkingPoint{
		// "Who to target" — category targets
		{Title: "City Council Member", Body: "Approves or cancels contracts at the local level. Most accessible and most impactful.", Category: "target", SortOrder: 1},
		{Title: "Mayor / City Manager", Body: "Often signs contracts without a full council vote. Pressure them to bring it to a public vote.", Category: "target", SortOrder: 2},
		{Title: "State Legislators", Body: "Can pass ALPR data governance laws. Several states have moved after constituent pressure.", Category: "target", SortOrder: 3},
		// "Tips that work"
		{Title: "Be specific about your city's contract", Body: "Look up whether your city actually has Flock cameras (check deflock.me) and mention the specific streets or neighborhoods. Generic emails get ignored; specific ones get responses.", Category: "tip", SortOrder: 1},
		{Title: "Mention the wins in other cities", Body: "Austin, Cambridge, Eugene, Flagstaff, and 25+ more have canceled contracts. Elected officials respond to precedent. Name the cities.", Category: "tip", SortOrder: 2},
		{Title: "Cc local journalists and advocacy groups", Body: "When officials know a journalist is watching, response rates go up dramatically. Find your local paper's city hall reporter and include them.", Category: "tip", SortOrder: 3},
		{Title: "Follow up exactly once per week", Body: "One email, one call, once a week. Consistent, polite, relentless. Most officials respond within 2–3 contacts.", Category: "tip", SortOrder: 4},
		{Title: "Ask for a meeting, not just a response", Body: "\"I'd love 15 minutes to discuss this\" is harder to ignore than \"please respond.\" In-person meetings are where contracts actually get reconsidered.", Category: "tip", SortOrder: 5},
		// "How public comment works"
		{Title: "Find the meeting", Body: "Use alpr.watch — it scans council agendas for Flock keywords and alerts you when it comes up.", Category: "comment", SortOrder: 1},
		{Title: "Sign up to speak", Body: "Most councils let you sign up online or at the door. You usually get 2–3 minutes.", Category: "comment", SortOrder: 2},
		{Title: "Bring receipts", Body: "Print the GainSec white paper summary, the EFF audit, and your city's contract if you can FOIA it.", Category: "comment", SortOrder: 3},
		{Title: "Bring people", Body: "Councils count heads. 10 people who show up beats 1,000 who sign a petition.", Category: "comment", SortOrder: 4},
		{Title: "Record it", Body: "Public meetings are public. Recording council members' responses creates accountability.", Category: "comment", SortOrder: 5},
		// "After the meeting"
		{Title: "After the meeting", Body: "Post your video to local neighborhood groups and Next Door", Category: "after", SortOrder: 1},
		{Title: "After the meeting", Body: "Tag your council member on social media with the recording", Category: "after", SortOrder: 2},
		{Title: "After the meeting", Body: "File a FOIA/public records request for the full Flock contract", Category: "after", SortOrder: 3},
		{Title: "After the meeting", Body: "Connect with your local ACLU chapter — they often want to know", Category: "after", SortOrder: 4},
		// "Spread the word" platforms
		{Title: "Social media", Body: "Share this site with the hashtag #DropFlock", Category: "spread", SortOrder: 1},
		{Title: "Social media", Body: "Post the Benn Jordan YouTube video — it's the most accessible explainer", Category: "spread", SortOrder: 2},
		{Title: "Social media", Body: "Tag your city council members directly when sharing local stories", Category: "spread", SortOrder: 3},
		{Title: "Social media", Body: "Screenshot the deflock.me map zoomed in on your neighborhood", Category: "spread", SortOrder: 4},
		{Title: "In your community", Body: "Print and post flyers at libraries, coffee shops, laundromats", Category: "spread", SortOrder: 5},
		{Title: "In your community", Body: "Bring it up at HOA, neighborhood, or PTA meetings", Category: "spread", SortOrder: 6},
		{Title: "In your community", Body: "Talk to local journalists — city hall reporters love this story", Category: "spread", SortOrder: 7},
		{Title: "In your community", Body: "Leave door hangers near known Flock camera locations", Category: "spread", SortOrder: 8},
		{Title: "Online groups", Body: "Post in local Facebook groups and Next Door", Category: "spread", SortOrder: 9},
		{Title: "Online groups", Body: "Share in Reddit local subreddits (r/yourcity)", Category: "spread", SortOrder: 10},
		{Title: "Online groups", Body: "Reach out to local Discord and Slack community servers", Category: "spread", SortOrder: 11},
		{Title: "Online groups", Body: "Send to your local buy-nothing or mutual aid group", Category: "spread", SortOrder: 12},
		// "Escalation paths"
		{Title: "Contact your ACLU state chapter", Body: "State ACLU chapters have been the most effective legal partners in fighting Flock contracts. Cambridge, Eugene, and San Jose lawsuits all involved ACLU backing.", Category: "escalate", SortOrder: 1, },
		{Title: "Start or join a local group", Body: "Eyes Off Eugene, Flock Off Ithaca, and TRUST Coalition all started with just a few people. Find your city on the Groups page or start your own.", Category: "escalate", SortOrder: 2},
		{Title: "Sign the FLOCKOut petition", Body: "Fight for the Future's national petition signals to legislators that this is a voting issue. It takes 30 seconds.", Category: "escalate", SortOrder: 3},
		{Title: "Push for state legislation", Body: "Oregon, New Jersey, Kentucky, and others are moving ALPR data governance bills. Contact your state rep to demand your state act next.", Category: "escalate", SortOrder: 4},
		// Shareable resources (uses title for the label, body is empty)
		{Title: "Benn Jordan's YouTube Video", Body: "https://www.youtube.com/watch?v=uB0gr7Fh6lY", Category: "shareable", SortOrder: 1},
		{Title: "GainSec White Paper", Body: "https://github.com/GainSec/anti-crime-ecosystem-research", Category: "shareable", SortOrder: 2},
		{Title: "EFF — ALPR Issues", Body: "https://www.eff.org/issues/license-plates", Category: "shareable", SortOrder: 3},
		{Title: "deflock.me Camera Map", Body: "https://deflock.me", Category: "shareable", SortOrder: 4},
		{Title: "Have I Been Flocked", Body: "https://haveibeenflocked.com", Category: "shareable", SortOrder: 5},
		{Title: "FLOCKOut Petition", Body: "https://www.fightforthefuture.org/actions/flockout/", Category: "shareable", SortOrder: 6},
		// RepFinder fallback links (when backend has no reps for a ZIP)
		{Title: "USA.gov — Find Local Officials", Body: "https://www.usa.gov/elected-officials", Category: "rep_lookup", SortOrder: 1},
		{Title: "Common Cause — Find Your Reps", Body: "https://www.commoncause.org/find-your-representative/", Category: "rep_lookup", SortOrder: 2},
		{Title: "Vote.org — Elected Officials", Body: "https://www.vote.org/elected-officials/", Category: "rep_lookup", SortOrder: 3},
	}
	for _, r := range rows {
		_, err := p.Exec(ctx, `
			INSERT INTO talking_points (title, body, category, sort_order, published)
			VALUES ($1, $2, $3, $4, true)
		`, r.Title, r.Body, r.Category, r.SortOrder)
		if err != nil {
			return err
		}
	}
	return nil
}

// ── reps ─────────────────────────────────────────────────────────────────────

type seedRep struct {
	ZipPrefix string
	Level     string
	Name      string
	Role      string
	URL       string
	Email     string
}

func (p *Pool) seedReps(ctx context.Context) error {
	empty, err := p.emptyTable(ctx, "reps")
	if err != nil || !empty {
		return err
	}
	// Curated, deliberately small dataset — covers the ZIP prefixes most
	// likely to be tested. Operator extends via SQL or a future admin UI.
	now := time.Now()
	rows := []seedRep{
		// 021 — Boston, MA
		{ZipPrefix: "021", Level: "city", Name: "City of Boston", Role: "Mayor’s Office", URL: "https://www.boston.gov/departments/mayors-office"},
		{ZipPrefix: "021", Level: "city", Name: "Boston City Council", Role: "City Council", URL: "https://www.boston.gov/citycouncil"},
		{ZipPrefix: "021", Level: "state", Name: "Massachusetts State Legislature", Role: "State Reps & Senators", URL: "https://malegislature.gov/"},
		{ZipPrefix: "021", Level: "federal", Name: "Find your U.S. Congress members", Role: "U.S. House & Senate", URL: "https://www.congress.gov/"},
		// 100 — New York, NY
		{ZipPrefix: "100", Level: "city", Name: "City of New York", Role: "Mayor’s Office", URL: "https://www.nyc.gov/office-of-the-mayor"},
		{ZipPrefix: "100", Level: "city", Name: "New York City Council", Role: "City Council", URL: "https://council.nyc.gov/"},
		{ZipPrefix: "100", Level: "state", Name: "New York State Senate & Assembly", Role: "State Reps", URL: "https://www.nysenate.gov/"},
		{ZipPrefix: "100", Level: "federal", Name: "Find your U.S. Congress members", Role: "U.S. House & Senate", URL: "https://www.congress.gov/"},
		// 200 — Washington, DC
		{ZipPrefix: "200", Level: "city", Name: "Mayor of the District of Columbia", Role: "Mayor", URL: "https://mayor.dc.gov/"},
		{ZipPrefix: "200", Level: "city", Name: "Council of the District of Columbia", Role: "City Council", URL: "https://dccouncil.us/"},
		{ZipPrefix: "200", Level: "federal", Name: "Find your U.S. Congress members", Role: "U.S. House & Senate (DC has no voting Senators)", URL: "https://www.congress.gov/"},
		// 600 — Chicago, IL
		{ZipPrefix: "600", Level: "city", Name: "City of Chicago", Role: "Mayor’s Office", URL: "https://www.chicago.gov/city/en/depts/mayor.html"},
		{ZipPrefix: "600", Level: "city", Name: "Chicago City Council", Role: "City Council", URL: "https://www.chicago.gov/city/en/depts/council.html"},
		{ZipPrefix: "600", Level: "state", Name: "Illinois General Assembly", Role: "State Reps & Senators", URL: "https://www.ilga.gov/"},
		{ZipPrefix: "600", Level: "federal", Name: "Find your U.S. Congress members", Role: "U.S. House & Senate", URL: "https://www.congress.gov/"},
		// 900 — Los Angeles, CA
		{ZipPrefix: "900", Level: "city", Name: "City of Los Angeles", Role: "Mayor’s Office", URL: "https://www.lamayor.org/"},
		{ZipPrefix: "900", Level: "city", Name: "Los Angeles City Council", Role: "City Council", URL: "https://www.lacity.org/government/city-council"},
		{ZipPrefix: "900", Level: "state", Name: "California State Legislature", Role: "State Reps & Senators", URL: "https://www.legislature.ca.gov/"},
		{ZipPrefix: "900", Level: "federal", Name: "Find your U.S. Congress members", Role: "U.S. House & Senate", URL: "https://www.congress.gov/"},
		// 770 — Houston, TX
		{ZipPrefix: "770", Level: "city", Name: "City of Houston", Role: "Mayor’s Office", URL: "https://www.houstontx.gov/mayor/"},
		{ZipPrefix: "770", Level: "city", Name: "Houston City Council", Role: "City Council", URL: "https://www.houstontx.gov/council/"},
		{ZipPrefix: "770", Level: "state", Name: "Texas Legislature", Role: "State Reps & Senators", URL: "https://capitol.texas.gov/"},
		{ZipPrefix: "770", Level: "federal", Name: "Find your U.S. Congress members", Role: "U.S. House & Senate", URL: "https://www.congress.gov/"},
		// 787 — Austin, TX (Flock contract canceled — included for reference)
		{ZipPrefix: "787", Level: "city", Name: "City of Austin", Role: "Mayor’s Office", URL: "https://www.austintexas.gov/mayor"},
		{ZipPrefix: "787", Level: "city", Name: "Austin City Council", Role: "City Council", URL: "https://www.austintexas.gov/austin-city-council"},
		{ZipPrefix: "787", Level: "state", Name: "Texas Legislature", Role: "State Reps & Senators", URL: "https://capitol.texas.gov/"},
		{ZipPrefix: "787", Level: "federal", Name: "Find your U.S. Congress members", Role: "U.S. House & Senate", URL: "https://www.congress.gov/"},
		// 974 — Eugene, OR (Flock contract canceled)
		{ZipPrefix: "974", Level: "city", Name: "City of Eugene", Role: "Mayor’s Office", URL: "https://www.eugene-or.gov/41/Mayor"},
		{ZipPrefix: "974", Level: "city", Name: "Eugene City Council", Role: "City Council", URL: "https://www.eugene-or.gov/40/City-Council"},
		{ZipPrefix: "974", Level: "state", Name: "Oregon State Legislature", Role: "State Reps & Senators", URL: "https://www.oregonlegislature.gov/"},
		{ZipPrefix: "974", Level: "federal", Name: "Find your U.S. Congress members", Role: "U.S. House & Senate", URL: "https://www.congress.gov/"},
		// 021 38 / 021 39 — Cambridge, MA (Flock paused)
		{ZipPrefix: "021", Level: "city", Name: "City of Cambridge, MA", Role: "City Manager’s Office", URL: "https://www.cambridgema.gov/citymanager"},
		// 148 — Ithaca, NY
		{ZipPrefix: "148", Level: "city", Name: "City of Ithaca", Role: "Mayor’s Office", URL: "https://www.cityofithaca.com/"},
		{ZipPrefix: "148", Level: "state", Name: "New York State Senate & Assembly", Role: "State Reps", URL: "https://www.nysenate.gov/"},
		// 778 — Bryan, TX
		{ZipPrefix: "778", Level: "city", Name: "City of Bryan, TX", Role: "City Council", URL: "https://www.bryantx.gov/city-council/"},
		{ZipPrefix: "778", Level: "state", Name: "Texas Legislature", Role: "State Reps & Senators", URL: "https://capitol.texas.gov/"},
		// 921 — San Diego, CA
		{ZipPrefix: "921", Level: "city", Name: "City of San Diego", Role: "Mayor’s Office", URL: "https://www.sandiego.gov/mayor"},
		{ZipPrefix: "921", Level: "city", Name: "San Diego City Council", Role: "City Council", URL: "https://www.sandiego.gov/citycouncil"},
		{ZipPrefix: "921", Level: "state", Name: "California State Legislature", Role: "State Reps & Senators", URL: "https://www.legislature.ca.gov/"},
		// National fallback — most prominent civic orgs (level=org)
		{ZipPrefix: "000", Level: "org", Name: "USA.gov — Find Local Officials", Role: "Federal directory", URL: "https://www.usa.gov/elected-officials"},
		{ZipPrefix: "000", Level: "org", Name: "Common Cause — Find Your Reps", Role: "Nonpartisan", URL: "https://www.commoncause.org/find-your-representative/"},
		{ZipPrefix: "000", Level: "org", Name: "Vote.org — Elected Officials", Role: "Voter info", URL: "https://www.vote.org/elected-officials/"},
		{ZipPrefix: "000", Level: "org", Name: "ACLU Affiliates Directory", Role: "Find your state chapter", URL: "https://www.aclu.org/about/affiliates"},
	}
	for _, r := range rows {
		_, err := p.Exec(ctx, `
			INSERT INTO reps (zip_prefix, level, name, role, contact_url, contact_email, created_at)
			VALUES ($1, $2, $3, $4, NULLIF($5, ''), NULLIF($6, ''), $7)
		`, r.ZipPrefix, r.Level, r.Name, r.Role, r.URL, r.Email, now)
		if err != nil {
			return err
		}
	}
	return nil
}
