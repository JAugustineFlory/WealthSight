# WealthSight
> A single place to track your finances

[Live Demo](#) · [Report a Bug](https://github.com/JAugustineFlory/WealthSight/issues) · [Request a Feature](https://github.com/JAugustineFlory/WealthSight/wiki)
---

## Table of Contents
- [Description](#description)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [ERD](#erd)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Known Issues](#known-issues)
- [Dev Log / Changelog](#dev-log--changelog)
- [License](#license)
---

### ERD - Entity Relationship Diagram
```mermaid
erDiagram
  USERS ||--o{ CATEGORIES : creates
  USERS ||--o{ CARDS : owns
  USERS ||--o{ BILLS : owns
  USERS ||--o{ INCOME : owns
  USERS ||--o{ BUDGETS : owns
  CARDS ||--o{ BILLS : "pulls from"
  CATEGORIES ||--o{ BILLS : tags
  CATEGORIES ||--o{ INCOME : tags
  CATEGORIES ||--o{ BUDGETS : limits
  USERS ||--o{ HOUSEHOLD_MEMBERS : belongs_to
  HOUSEHOLDS ||--o{ HOUSEHOLD_MEMBERS : has

  USERS {
    uuid id PK
    string username
    string email
    string password_hash
  }
  CATEGORIES {
    uuid id PK
    uuid user_id FK
    string name
    string type
  }
  CARDS {
    uuid id PK
    uuid user_id FK
    string nickname
    string organization
    decimal credit_limit
    decimal current_debt
    decimal apr
    date due_date
  }
  BILLS {
    uuid id PK
    uuid user_id FK
    uuid card_id FK
    uuid category_id FK
    string name
    decimal amount
    date due_date
    string status
  }
  INCOME {
    uuid id PK
    uuid user_id FK
    uuid category_id FK
    string source
    decimal amount
    date date
  }
  BUDGETS {
    uuid id PK
    uuid user_id FK
    uuid category_id FK
    decimal monthly_limit
    string month_year
  }
  HOUSEHOLDS {
    uuid id PK
    string name
  }
  HOUSEHOLD_MEMBERS {
    uuid id PK
    uuid user_id FK
    uuid household_id FK
  }
```
---
### Decision Tree Wireframe
![alt text](<DecisionTreeWireframe.png>)

---
