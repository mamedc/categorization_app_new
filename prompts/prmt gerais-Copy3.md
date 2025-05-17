After implementing the suggested changes, something went wrong.
Please check the error in the attached image.



# Improve prompt

The prompt below, delimited by by triple quotes, will be submited to a LLM.
The LLM task will be to correct the screen positioning after refreshings.
Please improve the prompt so I can go on with the component improvement.

"""
# 1. Context

You are contributing to a React application that helps users manage and classify financial transactions. \
The application uses Chakra UI v3 for all styling and UI components. The main layout includes a top \
navigation bar with four sections:

* Transactions: Displays a list of all financial transactions along with their associated tags.
* Tags: Lists all existing tag groups and their respective tags.
* Import: Allows users to import transactions from a CSV file.
* Settings: Provides configuration options for the application.

In the Transactions section, transactions are currently grouped by date, with each group having a \
date-based header. The running balance for each transaction group is also displayed in the group header.

---

# 2. Task

When the user perfor actions over a transaction, as for example editing, the transactions grid is refreshed, \
and the position the grid was in the screen is reseted and the user has to scroll down to the edited transaction \
again. This behaviour brings a lot of friction to the user experinece, as the grid has many transactions, it may \
be difficult to the user to find the last edited transaction. 

So your task is to keep the memory of the transaction grid position in order to reposition the screen after \
it refreshes.

---

# 3. Reference Components

Use the current implementation of the components (enclosed between triple backticks) as a base:

{files_presented}

# 4. Chakra UI v3 Documentation

Refer to the official Chakra UI v3 documentation for component usage, styling, and best practices:

{docs_presented}

# 5. Guidelines

- Use only **Chakra UI v3** components.
- Preserve the existing structure and behavior of the app.
- Follow clean code principles: clarity, simplicity, maintainability.
- Use **4-space indentation**.
- Avoid introducing third-party libraries or custom CSS; rely solely on Chakra UI capabilities.

"""