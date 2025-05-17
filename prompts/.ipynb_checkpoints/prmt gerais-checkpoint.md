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

The main layout includes a top **Navigation Bar** that allows users to switch between different views:
- In the **Transactions** section, users see a list of all transactions along with their associated tags.
- In the **Tags** section, users see a list of all existing tag groups and their respective tags.

Both sections feature an **Actions Bar** with options to **Add**, **Edit**, and **Delete** objects \
according to the current selection in the grid.

# 2. Task

Your task is to add a new view called **Import Transactions** with the specific functionalities below:

- The new **Import Transactions** will be accessed by the **Navigation Bar** in the same way as **Transactions** \
and **Tags**. When accessed, the user will start a sequence of four screens that will guide her \
with the objective of importing new transactions contained in a CSV file. A step indicator must be provided in order \
to the user be aware of what step she is in.

- Screen 1: will present the user with a button called **Choose file**, where she will be able to select the CSV file \
to be imported. A **Drag and Drop** area will also be provided as an option to select the CSV file. After the file \
selection and clicking the "Next" button, the user will be redirected to the next screen.

- Screen 2: this screen will be divided in tow sections, "Settings" as a left hand side vertical bar, and \
"Content Table" showing the CSV file content. Two buttons must be presented: "Next" that will bring the user \
to the next screen, and "Cancel" to cancel the importing. The name of the imported file must be displayed at the top.

- Screen 2 Settings: the following input fields will be displayed so the user can select how the file will be imported:
  - "Has header row" option: a toggle button by witch the user will select if the imported file has a header.
  - "Rows range" option: "First row" and "Last Row" input filds will indicate the range of rows to be imported.
  - "Date format" option: input field indicating the format of the date column in the CSV file. Should be \
  filled initialy with the format "dd/mm/yyyy".
  - "Columns mapping" option: three input fields respectivelly called "Date", "Description" and "Amount", to be \
  filled by the user with the column of the CSV file where these infos are presented in the CSV file.

- Screen 2 Content Table: a table containing the CSV file data. This table must be dinamically formated as the user \
updates the options mentioned above in **Screen 2 Settings**. It must have the rows (numbers) and columns (letters) \
indicators.

- Screen 3: in this screen, a table will display only the transactions filtered in **Screen 2**. The table will \
contain a checkbox for each row to be selected by the user. A "Select All" check box must be also available. The last \
column of this table will contain a flag indicating if the respective row already exists in the transactions database. \
By default, all rows that do not exist in the database must be checked. In this screen, the user will be able to \
click the buttons "Prev", to go back to **Screen 2**, "Next" to go foward to **Screen 4** or "Cancel" to cancel \
the importing.

- Screen 4: in this screen, the user will be presented with a table containing the final transactions to be imported. \
She will be able to click the buttons "Prev", to go back to **Screen 3**, "Import" to go import the displayed \
transactions and "Cancel" to cancel the importing.

- After selecting "Import" in this last screen, the selected transactions will be recorded in the "Transactions" \
table in the database .

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