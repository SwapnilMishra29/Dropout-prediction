# Skeleton Components - Technical Reference

## Overview

Skeleton components are **content placeholders** that display while data is loading. They improve perceived performance by showing users the content structure immediately.

---

## Components

### StatCardSkeleton
**Location:** `components/skeletons/StatCardSkeleton.tsx`

Mimics a stat card with animated title and value.

```tsx
import { StatCardSkeleton, StatCardSkeletonGrid } from '@/components/skeletons';

// Single skeleton
<StatCardSkeleton />

// Grid of 4 skeletons
<StatCardSkeletonGrid />
```

**Usage:**
```tsx
{loading ? <StatCardSkeletonGrid /> : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard title="Total" value={100} icon={Users} />
    <StatCard title="High Risk" value={25} icon={AlertTriangle} />
    {/* ... */}
  </div>
)}
```

**Visual:**
```
┌─────────────────┐
│ ████████ ■■■■■  │  (animated gray blocks)
│ ████████████    │
│ ■■■■■■■■■■■■   │
└─────────────────┘
```

---

### DataTableSkeleton
**Location:** `components/skeletons/DataTableSkeleton.tsx`

Mimics a data table with headers and rows.

```tsx
import { DataTableSkeleton } from '@/components/skeletons';

// Default: 5 rows, 4 columns
<DataTableSkeleton />

// Custom dimensions
<DataTableSkeleton rows={10} columns={6} />
```

**Props:**
- `rows`: Number of table rows to show (default: 5)
- `columns`: Number of columns to show (default: 4)

**Usage:**
```tsx
{loading ? (
  <div className="p-6">
    <DataTableSkeleton rows={8} columns={4} />
  </div>
) : (
  <DataTable columns={columns} data={data} />
)}
```

**Visual:**
```
┌────────┬────────┬────────┬────────┐
│ ■■■■■  │ ■■■■■  │ ■■■■■  │ ■■■■■  │
├────────┼────────┼────────┼────────┤
│ ████   │ ████   │ ████   │ ████   │
│ ████   │ ████   │ ████   │ ████   │
│ ████   │ ████   │ ████   │ ████   │
└────────┴────────┴────────┴────────┘
```

---

### ChartSkeleton
**Location:** `components/skeletons/ChartSkeleton.tsx`

Generic skeleton for any chart component.

```tsx
import { ChartSkeleton, PieChartSkeleton } from '@/components/skeletons';

// Generic chart
<ChartSkeleton />

// Custom title and height
<ChartSkeleton title={true} height={300} />

// Pie chart specific
<PieChartSkeleton />
```

**Props:**
- `title`: Show title skeleton (default: true)
- `height`: Height of chart area in pixels (default: 250)

**Usage:**
```tsx
{loadingChart ? (
  <ChartSkeleton title="Risk Distribution" height={300} />
) : (
  <PieChart data={pieData} />
)}
```

**Visual:**
```
┌──────────────────────────┐
│ ■■■■■■■ (title)         │
├──────────────────────────┤
│                          │
│      ████████████        │  (animated)
│    ███████████████       │
│    ███████████████       │
│      ████████████        │
│                          │
└──────────────────────────┘
```

---

## Animation

All skeletons use CSS `animate-pulse` for smooth animation.

```css
/* Built into Skeleton component */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## Styling

Skeletons inherit the theme (light/dark mode):

```tsx
// Light mode
<div className="bg-accent animate-pulse rounded-md" />
// → Light gray animated background

// Dark mode
<div className="dark:bg-gray-700 animate-pulse rounded-md" />
// → Darker gray animated background
```

---

## Usage Pattern

### Basic Pattern
```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().then(() => setLoading(false));
}, []);

return loading ? <Skeleton /> : <RealContent />;
```

### With Multiple States
```tsx
const [loadingStats, setLoadingStats] = useState(true);
const [loadingTable, setLoadingTable] = useState(true);

useEffect(() => {
  Promise.all([
    fetchStats().then(() => setLoadingStats(false)),
    fetchTable().then(() => setLoadingTable(false))
  ]);
}, []);

return (
  <>
    {loadingStats ? <StatCardSkeletonGrid /> : <Stats />}
    {loadingTable ? <DataTableSkeleton /> : <Table />}
  </>
);
```

### With Sections
```tsx
const [section, setSection] = useState({
  stats: true,
  table: true,
  chart: true
});

return (
  <div className="space-y-6">
    {section.stats && <StatCardSkeletonGrid />}
    {section.table && <DataTableSkeleton />}
    {section.chart && <ChartSkeleton />}
  </div>
);
```

---

## Performance Considerations

### ✅ Do's
- Use skeletons for sections > 500ms to load
- Use partial skeletons for progressive loading
- Keep skeleton complexity similar to real content
- Combine with error states

### ❌ Don'ts
- Don't use skeletons for < 200ms loads (too flashed)
- Don't show infinite skeletons (add timeout)
- Don't make skeletons more complex than real UI
- Don't forget to hide skeleton when loading completes

---

## Error Handling

```tsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData()
    .then(data => setData(data))
    .catch(err => setError(err))
    .finally(() => setLoading(false));
}, []);

return loading ? (
  <Skeleton />
) : error ? (
  <ErrorState error={error} />
) : (
  <RealContent />
);
```

---

## Examples from Codebase

### Dashboard
```tsx
// Before: Full page spinner
{loading ? <Spinner /> : <Dashboard />}

// After: Progressive skeleton loading
<div>
  {loadingStats ? <StatCardSkeletonGrid /> : <Stats />}
  {loadingCharts ? <ChartSkeleton /> : <Charts />}
  {loadingTable ? <DataTableSkeleton /> : <Table />}
</div>
```

### Students Page
```tsx
// Shows skeleton table while fetching predictions
{loading ? (
  <div className="p-6">
    <DataTableSkeleton rows={8} columns={6} />
  </div>
) : (
  <DataTable data={students} />
)}
```

---

## Accessibility

Skeletons should:
- Have semantic HTML structure
- Include proper spacing/margins
- Use `aria-busy="true"` on container
- Reset `aria-busy="false"` when loaded

```tsx
<div aria-busy={loading}>
  {loading ? <Skeleton /> : <Content />}
</div>
```

---

## Dark Mode Support

All skeletons automatically support dark mode:

```tsx
// Auto-handled by Tailwind
<Skeleton className="h-4 w-24" />
// Light: bg-gray-200
// Dark: bg-gray-700
```

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).

CSS animations are hardware-accelerated for smooth performance.

---

## Future Enhancements

1. **Shimmer Effect**: Add directional animation
2. **Color Variants**: Skeleton with different colors
3. **Accessibility**: Better ARIA support
4. **Customization**: Theme-aware skeleton styling

