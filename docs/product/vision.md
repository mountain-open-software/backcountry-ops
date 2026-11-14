# Open Mountain — Product Vision

Version: 2.0  
License: Apache License 2.0  
Product model: Open-source, self-hosted, extensible foundation

## 1. Vision

Open Mountain is an open-source technology foundation for the backcountry community.

It provides reusable software capabilities for backcountry planning, field intelligence, environmental information, observations and operational workflows. Individuals, communities, non-profit organizations and professional operators can deploy, extend or fork Open Mountain to build products suited to their needs.

Open Mountain aims to make backcountry technology more accessible while enabling independent applications and organizations to share a common foundation.

One shared foundation. Multiple independent products. An interoperable backcountry ecosystem.

## 2. Mission

The mission of Open Mountain is to:

- Make useful backcountry planning and field technology accessible to recreational users.
- Provide a reusable, open foundation for professional and community applications.
- Enable organizations to build and maintain their own products without starting from scratch.
- Encourage interoperability and responsible exchange of backcountry information.
- Support community-led development and long-term technological independence.

## 3. Open-source principles

Open Mountain is fully open source under the Apache License 2.0.

The project is guided by the following principles:

- Open source: The platform and its core capabilities are available under Apache 2.0.
- Self-hosted: Individuals and organizations can operate their own deployments.
- No proprietary tiers: Core and professional capabilities are not reserved for paid editions.
- No mandatory SaaS: The platform does not require a centrally hosted service to function.
- Forkable: Organizations may fork and adapt the codebase for their own products.
- Extensible: Custom capabilities should be implementable through documented extension points.
- Interoperable: APIs and data contracts enable integration with independent systems.
- Data sovereignty: Deployments control their data, permissions, retention and sharing.
- Community-driven: Improvements can be contributed upstream for the benefit of the ecosystem.

## 4. Product strategy

Open Mountain has two complementary product directions built on one shared foundation.

### 4.1 Recreational application — primary user experience

The Open Mountain application prioritizes accessible backcountry planning and field use.

Core capabilities include:

- Trip and route planning.
- Terrain and mapping integration.
- Weather forecasts and environmental context.
- Field recording and personal observations.
- GPS-based activity and location capture.
- Trip history and review.
- Offline-first operation and synchronization.
- Planning, briefing and information presentation.

The recreational application is the initial product focus and the principal way to demonstrate the value of the shared foundation.

### 4.2 Professional mode — interoperable experience

Open Mountain may provide configurable professional capabilities for organizations that choose to use its application.

Potential capabilities include:

- Professional observations and structured field records.
- Team and operational context.
- Configurable workflows.
- Planning, briefing and reporting.
- Controlled information sharing.
- External platform integrations.

Professional mode is not a commercial edition or a feature-restricted tier. It is a configurable experience built on the same open platform.

Professional organizations may instead use Open Mountain exclusively as infrastructure beneath their own applications.

## 5. Open Mountain as a technology foundation

The platform is designed to be useful independently of the Open Mountain user-facing application.

Its shared capabilities include:

- Canonical backcountry domain model.
- Domain and application services.
- Versioned APIs and contracts.
- Data storage and persistence abstractions.
- Offline data capture and synchronization.
- Workflow infrastructure.
- Agent and AI integration infrastructure.
- Integration and adapter framework.
- Authentication and authorization interfaces.
- Deployment and operational tooling.

The platform should remain modular, understandable and maintainable. Common capabilities belong in the core; organization-specific behavior belongs in extensions or downstream products.

## 6. Architecture for adoption and forkability

Open Mountain is explicitly designed for organizations to build products on top of it.

The architecture must support three adoption paths:

1. Use: Deploy the standard platform and configure its capabilities.
2. Extend: Add modules, workflows, integrations and interfaces while retaining upstream compatibility.
3. Fork: Adapt the codebase into an independent product while retaining the freedom to maintain a separate roadmap.

### Architectural requirements

- Stable and documented module interfaces.
- Versioned APIs with compatibility policies.
- Extensible domain entities and classifications.
- Organization-specific modules without unnecessary core modifications.
- Configurable workflows and replaceable providers.
- Pluggable integrations and identity systems.
- Reproducible self-hosted deployments.
- Automated testing, migration and upgrade tooling.
- Developer documentation and example extensions.
- Clear contribution and release processes.

The project should optimize for downstream maintainability, not only internal development convenience.

## 7. Shared foundation, independent products

Open Mountain seeks to enable independent applications and organizations to share technology without surrendering autonomy.

Potential ecosystem participants include:

- Recreational backcountry users.
- Non-profit organizations.
- Professional mountain and avalanche operations.
- Mapping and navigation providers.
- Avalanche information organizations.
- Research institutions.
- Data providers.
- Open-source contributors.
- Standards organizations and integration partners.

Organizations such as Outmap, CAA InfoEx and Avalanche Canada could use, extend or fork the foundation, subject to their own technical, operational and governance decisions.

Open Mountain does not assume their adoption or imply formal partnerships.

## 8. Interoperability and integrations

Interoperability is a core architectural objective.

The platform should expose stable interfaces and support adapters for external systems, including mapping applications, professional information platforms and relevant data providers.

Potential integration directions include:

- Outmap for mapping and navigation-related interoperability.
- CAA InfoEx for professional observation exchange.
- Avalanche Canada systems for authorized data exchange.
- Other regional platforms, organizations and standards.

Integrations should be modular and independently maintainable. The core must not depend on any single external platform.

### InfoEx integration direction

Open Mountain should support preparing and submitting observations to InfoEx through authorized, documented integration mechanisms.

A future adapter may map the Open Mountain observation model to CAAML and other supported interfaces. Submission must respect the destination platform’s authorization, validation, data-sharing and operational requirements.

The integration is a capability of the open foundation, not a requirement for all deployments.

## 9. Canonical backcountry domain model

The domain model is one of Open Mountain’s most important shared assets.

It should provide consistent representations for common concepts such as:

- Trips and routes.
- Activities and terrain.
- Observations and field records.
- Weather and environmental conditions.
- Snow and avalanche-related information.
- Locations and geospatial features.
- Users, organizations and operational contexts.
- Sources, provenance and permissions.

The model must be extensible, versioned and independent of any single application’s database schema or external platform’s data model.

External standards and systems should be supported through explicit mappings rather than defining the internal model exclusively.

## 10. AI and agent infrastructure

Open Mountain may incorporate AI agents to reduce field and operational workload.

Potential capabilities include:

- Voice-to-structured observation extraction.
- Classification and enrichment of field records.
- Summarization of recent observations.
- Weather and environmental context synthesis.
- Trip briefings and operational reporting.
- Assistance with review and information preparation.

AI output must preserve source attribution and uncertainty. Professional decisions remain with authorized people and organizations.

The agent infrastructure should be modular and support interchangeable providers and deployment configurations where feasible.

## 11. Offline-first and field-oriented design

Backcountry environments frequently have limited or absent connectivity.

Open Mountain should therefore prioritize:

- Local data capture.
- Offline access to relevant information.
- Queued synchronization.
- Conflict handling and reconciliation.
- Clear synchronization status.
- Resilient operation under intermittent connectivity.
- Preservation of original observations and provenance.

Offline functionality is a foundational platform capability, not an optional enhancement.

## 12. Governance, data ownership and sharing

Open source does not automatically mean open data.

Backcountry information can be sensitive, including precise locations, personal information, operational details and observations about vulnerable areas.

The platform must provide:

- Explicit sharing permissions.
- Organization-level access control.
- User-controlled data export.
- Data retention policies.
- Source attribution and provenance.
- Clear licensing for shared observations.
- Protection for restricted professional information.
- Consent and authorization before external submissions.

The project should encourage useful community data sharing while respecting ownership, privacy and professional information-sharing agreements.

## 13. Sustainability and project model

Open Mountain is not built around enterprise licensing, proprietary editions or mandatory hosted services.

Its sustainability and development model should be community-oriented and compatible with unrestricted use of the software.

Potential support mechanisms may include:

- Community contributions.
- Non-profit funding and grants.
- Donations and sponsorships.
- Development partnerships.
- Voluntary support and maintenance arrangements.

Such mechanisms must not introduce proprietary restrictions into the Apache 2.0 foundation or reserve core capabilities for paying users.

## 14. Initial product priorities

The initial use-case order is **day-trip planning**, **multi-day trip planning**, **daily process**, then **observation reporting**. See [Initial use cases](use-cases.md) for the product delivery priorities. The implementation priorities below describe supporting capabilities.

The initial implementation should focus on common capabilities that provide value to recreational users while establishing a reusable foundation for downstream products.

Recommended priorities:

1. Establish the canonical backcountry domain model.
2. Define modular architecture and extension contracts.
3. Build the recreational trip-planning experience.
4. Implement offline-first data capture and synchronization.
5. Integrate mapping, GPS and terrain capabilities.
6. Implement weather expectations and observations.
7. Build field recording and structured observations.
8. Aggregate and present recent observations.
9. Introduce AI agents for extraction, summarization and reporting.
10. Establish versioned APIs, SDKs and developer documentation.
11. Implement integration adapters, beginning with relevant standards and platforms.
12. Establish reproducible self-hosted deployment and upgrade tooling.

Professional operational capabilities and external integrations can expand incrementally without fragmenting the underlying platform.

## 15. Architectural decisions to validate

The following questions should be resolved as the project matures:

1. What module boundaries best support independent development and downstream forks?
2. Which APIs and contracts require formal compatibility guarantees?
3. How should domain extensions and organization-specific classifications work?
4. Which mapping and geospatial components best support the open foundation?
5. What capabilities can realistically execute locally on mobile devices?
6. How should organizations deploy, upgrade and maintain their own instances?
7. Which data standards should define mappings for the canonical observation model?
8. What are the authorized integration paths for CAA InfoEx and Avalanche Canada?
9. How should community observations be licensed and shared?
10. What governance structure will guide community contributions and project direction?
11. How will community funding and maintenance remain sustainable?
12. What minimum data and operational security requirements should apply to self-hosted deployments?

## 16. Guiding statement

Open Mountain is an Apache 2.0 open-source foundation for the backcountry community.

It combines planning capabilities, field technology, environmental intelligence, interoperable data models and extensible infrastructure into a platform that can be deployed, extended or forked independently.

Its purpose is not to own the backcountry application ecosystem, centralize its data or create dependency on a proprietary service.

Its purpose is to give individuals and organizations access to technology they can use, understand, adapt and build upon.

Open technology. Independent products. Shared backcountry infrastructure.
