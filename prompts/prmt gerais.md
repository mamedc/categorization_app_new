After implementing the suggested changes, something went wrong.
Please check the error in the attached image.



# Improve prompt

The prompt below, delimited by by triple quotes, will be submited to a LLM.
The LLM task will be to add a new functionality in the React application.
Please improve the prompt so I can go on with the component improvement.

"""
# 1. Context

You are contributing to a React application that helps users manage and classify financial transactions. \
The app uses Chakra UI v3 for UI components and is composed of multiple sections: Transactions, Tags, \
Import, and Settings. Transactions are grouped by date, with running balances displayed.

A new feature called "Documents" needs to be implemented. This feature allows users to attach documents \
to a transaction, which will keep this document referenced to it. Each document must be refereced to one transaction. \
A transaction may have multiple documents attached to it.

---

# 2. Documents Functionality Behavior

**Entry Point:**
- "Attach Document" section after the "Tags" section inside "EditTransactionModal.jsx" component.
- "Add Doc" button to the user can select and upload the documment from their devise \
(use "FileUpload" component from Chakra UI v3).

**Upon confirmation:**
- The selected file will be added to the transaction documents list
- The user will be able to see all documents attached to the transaction.

**Managing Documents:**
- Deleting a document will remove it from the "Attach Document" section, as well from the database.
- Displaying the document will open a new tab in the browser so the user can inspect that.
- Downloading the document will download it to the user device.
- In the "Transaction Grid", a "Doc" badge must be displayed whenever a transaction has a document attached to it.

---

# 3. Task:

Your task is to implement the **Documents** functionality.

---

# 4. Reference Components

Use the current implementation of the components (enclosed between triple backticks) as a base:

{files_presented}

---

# 5. Chakra UI v3 Documentation

Refer to the official Chakra UI v3 documentation for component usage, styling, and best practices:

{docs_presented}

---

# 6. Guidelines

- Preserve the existing structure and behavior of the app.
- Follow clean code principles: clarity, simplicity, maintainability.
- Use **4-space indentation**.

"""