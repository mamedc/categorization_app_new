After implementing the suggested changes, something went wrong.
Please check the error in the attached image.



# Improve prompt

The prompt below, delimited by by triple quotes, will be submited to a LLM.
The LLM task will be to implement the search feature for the transactions window.
Please improve the prompt so I can go on with the component improvement.

"""
# 1. Context

You are working on a **React application** built with **Chakra UI v3** that allows users to manage and \
classify financial transactions.

The main layout includes a top navigation bar with the following sections:

- **Transactions** – Displays a list of financial transactions grouped by date, each group showing a date \
header and running balance.
- **Tags** – Lists all tag groups and their corresponding tags.
- **Import** – Allows users to import transactions from CSV files.
- **Settings** – Offers various configuration options for the application.

---

# 2. Problem

In the **Transactions** section, as the grid may have a lot of resgistries, it takes some \
time to the user locate a specific transaction she is looking for. Despite already having implemented \
a date sorting and filtering features, we need to garantee a smother work for the user, and come \
up with some solution to quickly locate a transaction or group of transactions.

---

# 3. Task

Create an SEARCH functionality inside **TransactionsManagement.jsx** so the user is able to search a transaction \
by keywords. The search box must be located at the **Actions Bar** and should search for any similar string \
contained in the followinf fields: 

- description
- note
- tags
- document names

---

# 4. Reference Components

Use the existing implementation enclosed in triple backticks as your starting point:

{files_presented}

---

# 5. Chakra UI v3 Documentation

Refer to the official Chakra UI v3 documentation for guidance on best practices and component usage:

{docs_presented}

---

# 6. Implementation Guidelines

- Use **only Chakra UI v3** components and idiomatic patterns.
- Do not introduce third-party libraries or custom CSS.
- Preserve the existing component structure and behavior.
- Apply clean code principles: clarity, simplicity, and maintainability.
- Use **4-space indentation** for all code.
- Where applicable, prefer Chakra’s `ref`, `Box`, or scroll container utilities for scroll tracking and restoration.


"""