```mermaid
graph TD;
    USERS -->|creates| CATEGORIES;
    USERS -->|owns| CARDS;
    USERS -->|owns| BILLS;
    USERS -->|owns| INCOME;
    USERS -->|owns| BUDGETS;
    CARDS -->|pulls from| BILLS;
    CATEGORIES -->|tags| BILLS;
    CATEGORIES -->|tags| INCOME;
    CATEGORIES -->|limits| BUDGETS;
    USERS -->|belongs to| HOUSEHOLD_MEMBERS;
    HOUSEHOLDS -->|has| HOUSEHOLD_MEMBERS;
```