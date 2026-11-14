# Open Mountain — Expedition Leadership, Shared Responsibility and Human Factors

Document type: Product Use Cases and Functional Requirements  
Primary operating mode: Self-guided mountain expeditions  
Secondary operating mode: Guided mountain expeditions  
Activities: Backcountry skiing, ski touring, ski mountaineering, alpine climbing and mountaineering

Status: Product requirements; implementation pending. Individual human-factor use cases and their definitions of done are linked in section 6.

## 1. Fundamental Product Principle

Open Mountain is designed primarily for people organizing and participating in their own mountain adventures.

The application supports self-guided groups in which participants collectively manage preparation, route selection, mountain conditions, risk assessment and operational decisions.

A trip leader may coordinate the group and perform many activities similar to those of a professional guide, but the leadership structure is different.

Self-guided mode:

- The trip leader facilitates planning, coordination and communication.
- Participants contribute observations, knowledge and assessments.
- Significant decisions are discussed and made through the group’s agreed decision process.
- Each participant retains responsibility for communicating concerns, limitations and readiness.
- The application supports shared situational awareness and collective decision-making.

Guided mode:

- A designated guide has defined professional responsibilities.
- Participants contribute information and communicate concerns.
- The guide directs activities and makes decisions within their professional responsibilities and organizational procedures.
- The application supports guide-specific operational and reporting requirements.

The underlying expedition lifecycle remains the same in both modes.

## 2. Expedition Operating Modes

| Dimension | Self-guided | Guided |
| --- | --- | --- |
| Primary user | Independent mountain group | Guide-led group |
| Leadership | Coordinating trip leader | Designated guide |
| Responsibility | Shared according to roles and circumstances | Guide has defined professional duties; participants retain responsibilities |
| Planning | Collaborative | Guide-led, with participant input |
| Risk assessment | Collective contribution | Guide-led professional assessment |
| Decision-making | Agreed group process | Guide-directed within professional responsibilities |
| Observations | All participants | Guide and participants |
| Human factors | Explicit group-level monitoring | Client and guide human-factor monitoring |
| Briefing | Group discussion | Guide briefing with participant engagement |
| Reporting | Shared trip review | Guide/organization reporting |

Self-guided does not mean that all participants have identical expertise or responsibilities. The system should recognize differences in experience, capability and assigned roles without automatically granting one participant professional authority.

## 3. Self-Guided Trip Leadership

The trip leader is a coordinator and facilitator.

### Responsibilities

- Initiate the trip plan.
- Coordinate participants.
- Facilitate objective selection.
- Ensure relevant information is available.
- Organize the morning briefing.
- Encourage discussion of risks and uncertainty.
- Coordinate route and timing decisions.
- Maintain communication arrangements.
- Encourage regular reassessment.
- Facilitate the end-of-day review.

### Shared group responsibilities

Participants should be encouraged to:

- Review the trip plan.
- Understand relevant mountain hazards.
- Communicate personal limitations.
- Contribute observations.
- Question assumptions.
- Raise concerns.
- Participate in decisions.
- Monitor changing conditions.
- Communicate fatigue, discomfort or reduced capability.
- Participate in emergency preparation and response.

Critical requirement: The application must not imply that assigning someone as trip leader transfers all safety responsibility to that person.

The trip leader is an operational role, not a certification or guarantee of competence.

## 4. Human Factors as a Core Safety Domain

Human factors are a major contributor to risk in self-guided skiing and mountaineering.

A group may have accurate weather forecasts, reliable avalanche observations and appropriate equipment but still make poor decisions because of social pressure, cognitive biases, fatigue or communication failures.

Open Mountain should therefore evaluate the group’s decision-making conditions alongside environmental and terrain conditions.

Human factors should not be reduced to a numerical safety score.

### 4.1 Key human factors

| Human factor | Potential effect |
| --- | --- |
| Summit or objective fixation | Continuing despite deteriorating conditions |
| Commitment bias | Reluctance to abandon an invested plan |
| Social pressure | Participants suppressing concerns |
| Authority gradient | Less experienced members deferring to the strongest personality |
| Overconfidence | Underestimating hazards or uncertainty |
| Familiarity | Treating familiar terrain as inherently safe |
| Expert halo | Assuming expertise in one area transfers to all decisions |
| Groupthink | Agreement without independent evaluation |
| Fatigue | Reduced attention, judgment and physical capability |
| Stress | Impaired communication and decision-making |
| Time pressure | Rushed decisions or delayed turnaround |
| Risk tolerance mismatch | Participants accepting different levels of exposure |
| Communication failure | Important observations not reaching the group |
| Goal pressure | Summit, descent or schedule becoming more important than conditions |
| Diffusion of responsibility | Everyone assuming someone else checked an issue |

These are prompts for reflection, not diagnoses of individual participants.

### 4.2 Group dynamics and safety

The system should help a group answer:

- Does everyone understand the objective?
- Is anyone uncomfortable with the planned terrain?
- Are participants able to express concerns?
- Is the group relying too heavily on one person’s judgment?
- Have alternatives been considered?
- Is anyone feeling pressured to continue?
- Are fatigue or timing affecting the decision?
- Does the group have a clear way to stop or change the plan?

A participant should be able to raise a concern without requiring approval from the trip leader.

### 4.3 Individual risk tolerance

Participants may have different acceptable levels of exposure.

The application should support a private or shared readiness and comfort check, with participant control over what is disclosed.

Example:

- Comfortable with the proposed objective.
- Comfortable only with a more conservative alternative.
- Need further information.
- Not comfortable proceeding.

A majority vote should not automatically override an individual’s safety concern or personal decision not to participate.

The application should encourage resolving material concerns before committing to consequential terrain.

## 5. Revised Daily Process for Self-Guided Groups

### Stage 1 — Collaborative preparation

The trip leader creates the initial plan, but participants can review and contribute.

The group:

1. Identifies objectives.
2. Reviews weather and mountain conditions.
3. Considers skiing or climbing alternatives.
4. Reviews group experience and capabilities.
5. Identifies equipment requirements.
6. Discusses acceptable exposure and uncertainty.
7. Establishes turnaround criteria.
8. Confirms communication and emergency arrangements.

Human-factor checkpoint: Are the objectives appropriate for the entire group, rather than just its strongest members?

### Stage 2 — Morning conditions update

Participants review new weather, avalanche, snowpack, climbing and terrain information.

The application should support independent review before the group discussion.

This helps reduce premature consensus and overreliance on the trip leader’s initial interpretation.

Human-factor checkpoint: Has the group genuinely reconsidered the plan in light of new information, or is it looking only for evidence supporting the original objective?

### Stage 3 — Shared assessment and planning

The group discusses:

- Current mountain hazards.
- Terrain exposure.
- Weather uncertainty.
- Participant readiness.
- Fatigue and fitness.
- Technical capability.
- Available alternatives.
- Turnaround criteria.

The trip leader facilitates discussion and records the agreed plan.

Human-factor checkpoint: Have quieter or less experienced participants had an opportunity to express concerns?

### Stage 4 — Group briefing

The trip leader coordinates a briefing covering:

- Objective and alternatives.
- Expected conditions.
- Significant hazards.
- Route and timing.
- Roles and responsibilities.
- Communication.
- Emergency arrangements.
- Turnaround criteria.
- Group readiness.

Every participant should be able to raise questions or concerns.

Human-factor checkpoint: Does everyone understand and accept the plan, including its alternatives and operating limits?

### Stage 5 — Field execution and continuous reassessment

All participants contribute observations and communicate changes.

The trip leader coordinates, but observations and concerns should not be restricted to the leader.

At consequential decision points, such as entering avalanche terrain, committing to an exposed climb, crossing a glacier or continuing toward a summit, the group should reassess.

Human-factor checkpoint:

- Are we continuing because conditions support the plan?
- Are we continuing because we have already invested time and effort?
- Is anyone reluctant to speak?
- Has fatigue changed our capabilities?
- Would we make the same decision if we were starting from here?

### Stage 6 — Group debrief

After the activity, participants discuss:

- What was expected?
- What was observed?
- Which decisions were made?
- Were concerns communicated?
- Did group dynamics influence decisions?
- Were turnaround criteria followed?
- Were any participants uncomfortable?
- What worked well?
- What should change next time?

The goal is learning, not assigning blame.

### Stage 7 — Shared report and next-day preparation

The application consolidates observations, routes, decisions and relevant lessons.

Participants can contribute to the report, while designated editors manage publication and sharing.

Human-factor reflections should remain private to the group or individual unless explicitly shared.

## 6. New Functional Use Cases

Each linked file defines the goal, flow, requirements, and testable definition of done.

- [UC-HF-01 — Group readiness and comfort check](use-cases/group-readiness.md)
- [UC-HF-02 — Independent assessment before group discussion](use-cases/independent-assessment.md)
- [UC-HF-03 — Participant raises a safety concern](use-cases/safety-concern.md)
- [UC-HF-04 — Decision checkpoint](use-cases/decision-checkpoint.md)
- [UC-HF-05 — Fatigue and time-pressure reassessment](use-cases/fatigue-time-pressure.md)
- [UC-HF-06 — Group decision and disagreement record](use-cases/group-decision.md)
- [UC-HF-07 — Human-factor debrief](use-cases/human-factor-debrief.md)

## 7. Updated Domain Model

The canonical domain should explicitly include shared responsibility and group decision-making.

The [community and trip model](../architecture/community-trip-model.md) clarifies the hierarchy: communities contain groups and trips; multi-day trips link day trips; each day trip owns its daily process/OperationalDay and observations. Expedition represents the trip lifecycle, not a duplicate set of daily records.

```text
Expedition
├── OperatingMode
│   ├── SelfGuided
│   └── Guided
├── Participants
├── Roles
├── ResponsibilityAssignments
├── GroupDecisionPolicy
└── OperationalDay
    ├── DailyPlan
    ├── ConditionsBriefing
    ├── ParticipantReadiness
    ├── GroupAssessment
    ├── HumanFactorReflection
    ├── Activities
    │   ├── GPS Tracks
    │   ├── Observations
    │   ├── Assessments
    │   ├── Concerns
    │   ├── DecisionCheckpoints
    │   └── Decisions
    ├── GroupDebrief
    └── DailyReport
```

Additional entities:

| Entity | Purpose |
| --- | --- |
| OperatingMode | Self-guided or guided |
| ResponsibilityAssignment | Explicit responsibilities without assuming professional authority |
| GroupDecisionPolicy | How the group intends to make decisions |
| ParticipantReadiness | Participant-controlled readiness and comfort information |
| SafetyConcern | A concern raised by any participant |
| DecisionCheckpoint | A significant point requiring reassessment |
| GroupAssessment | Assessment informed by multiple participants |
| DecisionContribution | Individual reasoning, alternatives or concerns |
| HumanFactorReflection | Private or shared reflection on group dynamics |
| GroupDebrief | Collective review of decisions and communication |

## 8. AI Agent Responsibilities

AI agents should support better group decision-making without becoming an authority figure.

### Planning Agent

- Present relevant conditions.
- Identify information gaps.
- Help prepare alternatives.
- Highlight differences between objectives and group capabilities.

### Conditions Agent

- Summarize weather, snowpack and climbing conditions.
- Preserve uncertainty and source references.
- Identify changes since the last briefing.

### Group Coordination Agent

- Prepare briefing material.
- Track assignments and check-ins.
- Surface unresolved concerns where authorized.
- Remind the group of agreed decision checkpoints.

### Observation Agent

- Convert voice into structured observations.
- Distinguish observations, interpretations and decisions.
- Preserve original evidence.

### Review Agent

- Compare planned and actual activities.
- Summarize decisions.
- Help identify lessons from the day’s experience.

AI must not:

- Declare a route safe.
- Certify a group’s competence.
- Infer psychological states without evidence.
- Override participant concerns.
- Replace the group’s agreed decision process.
- Present automated risk scores as professional judgments.

## 9. Key Product Requirements

1. Self-guided mode is the default experience.
2. Guided mode is an optional configuration.
3. The trip leader coordinates rather than automatically assumes all responsibility.
4. Participants can contribute observations, assessments and concerns.
5. Significant decisions can be collaborative.
6. Human factors are integrated throughout the daily process.
7. The application supports independent assessments and constructive disagreement.
8. A participant can decline an activity without being overruled by an app vote.
9. Group reflections and personal readiness information have explicit privacy controls.
10. The application remains usable offline.
11. The same canonical domain supports both operating modes.
12. AI facilitates information and discussion without becoming the decision-maker.

## 10. Guiding Product Principle

Open Mountain is designed to help self-guided mountain groups make better-informed decisions together.

Mountain safety depends not only on understanding weather, snow, terrain and technical hazards, but also on how people communicate, assess uncertainty, manage objectives and respond to changing circumstances.

The application should improve shared situational awareness, encourage independent thinking, make concerns easier to communicate and preserve the reasoning behind important decisions.

The trip leader coordinates the process. Participants share responsibility according to their roles and circumstances. The group remains responsible for its decisions.

Guided expeditions use the same underlying platform with a different leadership and responsibility model.

The central objective is not to automate mountain decisions. It is to support the people making them.
