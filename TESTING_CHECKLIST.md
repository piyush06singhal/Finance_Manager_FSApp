# Testing Checklist - Finance Manager

## ✅ Features to Test

### 1. Welcome Popup
- [ ] Visit dashboard for first time → Popup should appear
- [ ] Click "Got It!" → Popup closes and never shows again
- [ ] Refresh page → Popup should NOT appear again
- [ ] Clear localStorage → Popup appears again

### 2. Help Button Removed
- [ ] Check header → No "?" button should be visible
- [ ] Header should look clean with just user profile and logout

### 3. Month-over-Month Calculations
**Dashboard:**
- [ ] Add transactions from last month and this month
- [ ] Check "Net Change" card → Should show real % (not +0.0%)
- [ ] Percentage should be green if positive, red if negative

**Transactions Page:**
- [ ] Check "Total Income" → Should show real % vs last month
- [ ] Check "Total Expense" → Should show real % vs last month
- [ ] Check "Net Balance" → Should show real % vs last month

### 4. Savings (Pots) Functionality
**Create Savings Goal:**
- [ ] Click "Add Goal" button
- [ ] Fill in name, target, current amount
- [ ] Submit → Goal should appear

**Add Money to Savings:**
- [ ] Click "Add Money" on any savings goal
- [ ] Enter amount (e.g., $100)
- [ ] Submit → Pot total should increase by $100
- [ ] Check Transactions page → Should see "Added to [Goal Name]" transaction (negative)
- [ ] Check Dashboard → Main balance should decrease by $100

**Withdraw Money:**
- [ ] Click "Withdraw" on any savings goal
- [ ] Enter amount (e.g., $50)
- [ ] Submit → Pot total should decrease by $50
- [ ] Check Transactions page → Should see "Withdrew from [Goal Name]" transaction (positive)
- [ ] Check Dashboard → Main balance should increase by $50

**This Month Stats:**
- [ ] Add money to savings this month
- [ ] Check "This Month" card → Should show total added this month

### 5. Recurring Bills
**Create Bill:**
- [ ] Click "Add Bill"
- [ ] Fill in name, amount, due date
- [ ] Submit → Bill should appear

**Bill Status:**
- [ ] If today's date < due date → Status should be "Upcoming" (yellow)
- [ ] If today's date = due date → Status should be "Due" (red) with "Pay Now" button
- [ ] If today's date > due date → Status should be "Paid" (green)

**Pay Bill:**
- [ ] Wait for bill to be "Due" or manually set due date to today
- [ ] Click "Pay Now" button
- [ ] Check Transactions page → Should see bill payment transaction (negative)
- [ ] Check Dashboard → Balance should decrease by bill amount
- [ ] Bill status should change to "Paid"

### 6. Budget Synchronization
**Create Budget:**
- [ ] Click "New Budget"
- [ ] Fill in category (e.g., "Food"), amount (e.g., $500)
- [ ] Submit → Budget should appear

**Test Synchronization:**
- [ ] Go to Transactions page
- [ ] Add expense with same category as budget (e.g., "Food", $50)
- [ ] Go back to Budgets page
- [ ] Budget should show $50 spent
- [ ] Progress bar should be 10% filled (50/500)
- [ ] "Recent Transactions" should show the transaction

**Current Month Only:**
- [ ] Add transaction from last month with budget category
- [ ] Budget should NOT count it (only current month)
- [ ] Add transaction from this month
- [ ] Budget SHOULD count it

**Over Budget:**
- [ ] Add transactions that exceed budget limit
- [ ] Budget card should show red border
- [ ] Should show "Over budget by $X"
- [ ] Progress bar should be red

### 7. Dashboard Synchronization
**Total Balance:**
- [ ] Should show: All Income - All Expenses (all-time)
- [ ] Should show breakdown: Main balance | Savings balance

**Month Spending:**
- [ ] Should show only current month expenses
- [ ] Should show budget total
- [ ] Should show percentage used

**Budget Overview:**
- [ ] Should show top 3 budgets
- [ ] Should use current month data only
- [ ] Progress bars should match Budgets page

**Savings Overview:**
- [ ] Should show top 3 savings goals
- [ ] Progress should match Pots page

### 8. Complete Flow Test
**Scenario: Monthly Budget Management**
1. [ ] Create budget "Groceries" - $400
2. [ ] Add expense transaction "Supermarket" - $150, category "Groceries"
3. [ ] Check budget → Should show $150/$400 (37.5%)
4. [ ] Add another expense "Farmers Market" - $80, category "Groceries"
5. [ ] Check budget → Should show $230/$400 (57.5%)
6. [ ] Dashboard should reflect same numbers

**Scenario: Savings Goal**
1. [ ] Create savings goal "Vacation" - Target $2000, Current $500
2. [ ] Add $200 to savings
3. [ ] Check pot → Should show $700/$2000
4. [ ] Check transactions → Should see "Added to Vacation" -$200
5. [ ] Check dashboard → Main balance should be $200 less
6. [ ] Withdraw $100 from savings
7. [ ] Check pot → Should show $600/$2000
8. [ ] Check transactions → Should see "Withdrew from Vacation" +$100
9. [ ] Check dashboard → Main balance should be $100 more

**Scenario: Bill Payment**
1. [ ] Create bill "Netflix" - $15, due today
2. [ ] Bill should show as "Due" with "Pay Now" button
3. [ ] Click "Pay Now"
4. [ ] Check transactions → Should see "Netflix - Monthly Bill" -$15
5. [ ] Check dashboard → Balance should be $15 less
6. [ ] Bill status should be "Paid"

## 🐛 Common Issues to Check
- [ ] No console errors in browser
- [ ] All modals open and close properly
- [ ] All buttons are clickable
- [ ] Forms validate properly (can't submit empty)
- [ ] Numbers format correctly (currency, percentages)
- [ ] Dates display correctly
- [ ] Loading states work
- [ ] Data persists after page refresh

## 📱 Responsive Testing
- [ ] Test on mobile view (< 768px)
- [ ] Test on tablet view (768px - 1024px)
- [ ] Test on desktop view (> 1024px)
- [ ] All modals are responsive
- [ ] Navigation works on mobile

## ✅ Success Criteria
All checkboxes above should be checked with no errors or unexpected behavior.
