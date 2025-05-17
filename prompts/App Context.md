I am working in a Flask SQLAlquemy database to manage financial transactions classification. In this project, we have the following structure: 

1. Transaction: a financial transaction identified by an unique ID. Each transaction may have multiple tags associated to it (from the same or different TagGroups). As attributes, it has the following fields:
    - id (PK)
    - date (Date, not nullable)
    - amount (Decimal, not nullable)
    - description (String/Text)
    - created_at (DateTime, not nullable)
    - updated_at (DateTime, not nullable)
    - tags (SQLAlchemy relationship for the many-to-many link, using the association table)

3. Tag: a tag (or label), identified by an ID. Each tag belongs to one TagGroup, and may have multiple transactions associated to it. As attributes, it has the following fields:
    - id (PK)
    - name (String, not nullable, unique within a TagGroup)
    - color (String)
    - tag_group_id (FK referencing TagGroup.id, not nullable)
    - tag_group (SQLAlchemy relationship to the parent TagGroup)
    - transactions (SQLAlchemy relationship for the many-to-many link, using the association table)

4. TagGroup: each TagGroupg will have zero to multiple Tags. For example: the tags "Bus Fare", "Gas" and "Tool Fee" would belong to "Transportation" group. Another example is: the tags "Coffee", "Grocery" and "Lunch" would belong to "Food" group. As attributes, TagGroup will have following fields:
    - id (PK)
    - name (String, unique, not nullable)
    - tags (SQLAlchemy relationship back-reference to associated Tags)

5. Transaction/Tag association: this is a relationship between a transaction and a tag. Each transaction may have multiple tags (from the same or different tag groups) associated to it , and each tag may have multiple transactions associated to it.

Please help me to evaluate if this reasoning is correct to manage financial transactions classification system.




In relation to your comments, please consider:

- **created_at**: use DateTime type. As a default value use the current time.
- **updated_at**: add an **updated_at** field as well, updated automatically.
- Tag Name Uniqueness: Unique within a TagGroup.
- Cascade Behavior:
  - If a Tag is deleted, the corresponding entries in the transaction_tags association table should be deleted 
  - If a TagGroup is deleted, its Tags must also be deleted.

Please implement the following files according with the requirements:
- app.py
- models.py (remember to implement the association tables as you mentioned)
- routes.py
