# MFD Design System

This glossary defines the product and design-system language shared by the public library and its Reference CRM consumer.

## Language

**Client**:
An organization that receives services and is managed in Reference CRM. A Client may have contact details but is not itself a person, application user, or theme-owning tenant.
_Avoid_: Customer, account, contact

**Client Relationship Status**:
Whether a Client relationship is currently active or retained as inactive history. It is reversible, does not constrain Projects or other Client operations, and is independent from Project Status.
_Avoid_: Project status, lead stage, archive state

**Contact**:
A person associated with a Client. Version 1 stores only one primary contact inline with the Client and does not yet model Contact as a separate entity.
_Avoid_: Client, user

**Tenant**:
The runtime organizational context that selects a brand before application hydration. A Tenant is not a Client record managed inside Reference CRM.
_Avoid_: Client, theme

**User**:
The authenticated person operating Reference CRM, such as an account or project manager. A User is not the Client or its contact person.
_Avoid_: Client, contact

**Project**:
A unit of work delivered for exactly one Client. A Project cannot exist independently of its Client and does not contain task, billing, file, or team management in version 1.
Deleting a Client never deletes its Projects. A Client that still owns any Project is not deletable in version 1.
_Avoid_: Engagement, job, task

**Project Status**:
The current lifecycle state of a Project: planned before work starts, active while work proceeds, on-hold while intentionally paused, or completed when the agreed work is finished. Version 1 permits moving between any of these states.
_Avoid_: Stage, progress
