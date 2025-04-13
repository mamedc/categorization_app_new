After implementing the suggested changes, something went wrong.
Please check the error in the attached image.



# Improve prompt

The prompt below, delimited by by triple quotes, will be submited to a LLM.
The LLM task will be to add new functioonality to the React application.
Please improve the prompt so I can go on with the component improvement.


"""
# 1. Context

I am developing a React application using Chakra UI v3 to display and manage financial transactions.\
Each transaction is rendered in its own visual container (`Box`), and users can select \
**one transaction at a time** using a `Checkbox` displayed inside each transaction's card.\

The selection state is managed using React Context to ensure only one transaction can be selected \
at any given time.

---

# 2. Objective

Your task is to modify the provided React component(s) in order to add a sorting functionality \
for the existing transactions. The user will be able to choose one of the two options:
- to display the transactions in ascending order by date.
- to display the transactions in descending order by date.

---

# 3. Requirements

- The sorting component must be placed at the left side of the **Actions Bar**, witch is the same \
component where the **Add**, **Edit** and **Delete** buttons are placed.
- The solution should maintain compatibility with Chakra UI v3 and follow React best practices.

---

# 4. Input Files

The React component files are provided below (delimited by triple backticks):

{files_presented}

---

# 5. Chakra UI v3 Documentation

Refer to the Chakra UI v3 documentation provided below for any styling or component usage \
(especially `Checkbox`, `Flex`, `Button`, etc.):

{docs_presented}

---

# 6. Expected Behavior

- All current logics should be maintained.

---

# 7. Additional Notes

- Preserve the visual structure and styling already implemented in the app.
- Ensure minimal re-renders by using memoization or context selectors as appropriate.
- Format the output using 4-space indentation.
- Keep your code clean, readable, and idiomatic to modern React standards.
"""