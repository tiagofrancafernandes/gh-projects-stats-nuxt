# Programmable Metrics & Custom Logic

The dashboard allows you to define custom JavaScript logic for any card (Stat, Gauge, or Chart). This enables complex calculations, data merging, or even external API calls directly from the dashboard configuration.

## How it works

When a card has the `customFn` field defined, the dashboard bypasses the standard data mapping and executes your code instead.

### The Sandbox Environment

Your code runs in a secure, sandboxed `AsyncFunction`. It has access to:
- **`stats`**: The raw data object returned by the GitHub API.
- **`helpers`**: Utility functions for data manipulation.

## Examples

### 1. Random Number (Static Value)
Perfect for testing or placeholders.
```javascript
return Math.floor(Math.random() * 100);
```

### 2. Calculating Percentages
Calculate the percentage of closed items relative to total items.
```javascript
const total = stats.totalItems || 0;
const closed = stats.closedItems || 0;
if (total === 0) return 0;
return Math.round((closed / total) * 100);
```

### 3. Merging Multiple Metrics
Summing up two different metrics for a combined stat.
```javascript
return (stats.openIssues || 0) + (stats.openPRs || 0);
```

### 4. Chart Data (Pie/Line)
For charts, you should return an object or an array depending on the chart type.
```javascript
// Pie Chart example
return {
    "Completed": stats.closedItems,
    "In Progress": stats.openItems
};
```

## Failure Handling

If your function:
- Throws an error
- Returns a non-numeric value (for stats)
- Fails to resolve (async timeout)

The card will default to showing `0` or an empty state to prevent the entire dashboard from crashing.

## Best Practices
- **Keep it simple**: Extensive logic should ideally be handled on the server.
- **Null Safety**: Always use optional chaining or default values (`|| 0`).
- **Async calls**: While supported, keep them efficient to avoid slowing down the dashboard refresh cycle.
