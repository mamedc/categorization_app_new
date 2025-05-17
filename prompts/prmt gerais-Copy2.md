After implementing the suggested changes, something went wrong.
Please check the error in the attached image.



# Improve prompt

The prompt below, delimited by by triple quotes, will be submited to a LLM.
The LLM task will be to add a new functionality in the React application.
Please improve the prompt so I can go on with the component improvement.

"""
You are contributing to a React application that helps users manage and classify financial transactions. \
The application uses Chakra UI v3 for all styling and UI components. The main layout includes a top \
navigation bar with four sections:

* Transactions: Displays a list of all financial transactions along with their associated tags.
* Tags: Lists all existing tag groups and their respective tags.
* Import: Allows users to import transactions from a CSV file.
* Settings: Provides configuration options for the application.

In the Transactions section, transactions are currently grouped by date, with each group having a \
date-based header. The running balance for each transaction group is also displayed in the group header.


## Split functionality

Each transaction may contain distinct classified sub transactions. For example: the user may want to \
classify one groceries buying into two classes, one as "groceries" and one as "gifts". 

To be able to do that, the app must provide the ability to split the transaction into multiple ones. \
When splitting a transaction, the user will select the number of sub-transactions she wants to create, \
and the system will create it.



# 2. Task: Implement the "Split Transaction" Feature

We want to allow users to split a single transaction into multiple sub-transactions with individual \
classifications. This is useful for cases where a purchase needs to be divided into different categories \
(e.g., a $100 purchase could be split into $70 for “Groceries” and $30 for “Gifts”).

## Requirements:

- Trigger: Add a “Split” button on the **Action Buttons** group of **TransactionsManagement.jsx**.

## UI/UX:

- When triggered, open a modal (using Chakra UI v3) that allows the user to define how to split the transaction.
- Allow the user to specify only the number of sub-transactions.
- Provide Cancel and Confirm buttons to discard or apply the split.

## Behavior:

- Upon confirmation, insert into the transactions grid the new sub-transactions. Position them just after the \
original transaction. This positioning must always be mantained, i.e., the child transactions must always be \
located imediatly after it's parent transaction, independent of the sorting or filtering configurations.

- The sub-transactions will:
  - Inherit the following data from the original transaction: date, description, note and tags.
  - have the "amount" field initialized to zero.
  - be able to be edited as a it is a original transaction.

- The original transaction will:
  - Be maintained in the database.
  - Display it's amount subtracted by the amount of it's sub-transactions.
  - Display a "children_flag" badge, indicating it was splited.

- When a sub-transaction is deleted, it's parent amount will be added with the amount of the deleted sub-transaction.

- If a original transaction have already been splited, to add a new sub-transaction to it the user will access the \
"Split" modal to add the new sub-transaction.

- Maintain correct grouping and balance updates in the UI.

"""