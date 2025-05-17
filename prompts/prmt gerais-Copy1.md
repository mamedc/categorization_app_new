After implementing the suggested changes, something went wrong.
Please check the error in the attached image.



# Improve prompt

The prompt below, delimited by by triple quotes, will be submited to a LLM.
The LLM task will be to add a new functionality in the React application.
Please improve the prompt so I can go on with the component improvement.

"""
# 1. Context

I am developing a React application for managing and classifying financial transactions. 
The project uses **Chakra UI v3** for the interface design.

The main layout includes a top navigation bar that allows users to switch between different views:
- In the **Transactions** section, users see a list of all transactions along with their associated tags.
- In the **Tags** section, users see a list of all existing tag groups and their respective tags.
- In the **Import** section, user are able to select a CSV file containing new transactions to be uploaded.
- In the **Settings** section, user will be able to adjust the App settings.

# 2. Task

In the **Transactions** section, the transactions are grouped by date. Each group has a header indicating \
the group date. Your task is to include the **balance** for each group. It should work as follows:

- The **initial balance** must be displayed before the first transaction group. The first transaction group \
is the one with the oldest date.
- The balance of each following transaction group must be computed and displayed in it's header on the right \
hand side.
- The balance of each following transaction group must be calculated as follows:
  - Get the balance of the previous group. If it is the first group, the previopus balance is the initial balance.
  - The current group balance is the previous balance minus the sum of all transactions values of the current group.

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