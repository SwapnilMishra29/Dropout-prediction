# Dropout Early Warning System (EWS)

A comprehensive web application for identifying and supporting at-risk students before they drop out of school. Built with Next.js 16, React, Tailwind CSS, and Recharts.

## Features

### Dashboard
- Real-time student statistics and metrics
- Risk distribution visualization with pie charts
- Trend analysis with line charts
- Recent alerts and notifications
- Quick access to key performance indicators

### Student Management
- Complete student roster with filtering and sorting
- Advanced search capabilities
- Risk level filtering (Low, Medium, High, Critical)
- Pagination support for large datasets
- Individual student profiles with detailed information

### Student Details (Multi-tab Interface)
1. **Overview** - Basic student information and current risk assessment
2. **Risk Factors** - Detailed breakdown of factors contributing to dropout risk
3. **Attendance** - Attendance history and trends
4. **Academic Performance** - GPA, grades, and academic progress
5. **Engagement** - Parent involvement, counselor notes, and interventions

### Analytics & Insights
- Risk distribution analysis
- Enrollment and at-risk trends over time
- Top risk factors identification
- Performance metrics by grade level
- Statistical insights for data-driven decision making

### Alerts & Notifications
- New alerts dashboard with filtering
- Status tracking (New, Active, Resolved)
- Alert summaries and statistics
- Drill-down capability to student details
- Priority-based alert management

### Bulk Data Upload
- CSV file import for student data
- Template download for proper formatting
- Validation and error reporting
- Success metrics and detailed error logs
- Support for required and optional fields

### Settings
- Organization configuration (school name, admin email)
- Alert threshold customization
- Alert frequency preferences
- Email notification controls
- Display preferences (dark mode support)

## Technical Stack

- **Framework:** Next.js 16 with App Router
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Data Visualization:** Recharts
- **HTTP Client:** Axios
- **Icons:** Lucide React

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Dashboard page
│   ├── globals.css         # Global styles and theme
│   ├── students/
│   │   ├── page.tsx        # Students list page
│   │   └── [id]/
│   │       └── page.tsx    # Student detail page with tabs
│   ├── analytics/
│   │   └── page.tsx        # Analytics & insights page
│   ├── alerts/
│   │   └── page.tsx        # Alerts & notifications page
│   ├── settings/
│   │   └── page.tsx        # Settings page
│   └── bulk-upload/
│       └── page.tsx        # Bulk upload page
├── components/
│   ├── Sidebar.tsx         # Navigation sidebar (responsive)
│   ├── Header.tsx          # Page header
│   ├── RiskBadge.tsx       # Risk level badge component
│   ├── StatCard.tsx        # Statistics card component
│   ├── DataTable.tsx       # Sortable data table
│   ├── Modal.tsx           # Modal dialog component
│   ├── Toast.tsx           # Toast notification component
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── api-client.ts       # Axios HTTP client
│   ├── api-types.ts        # TypeScript type definitions
│   ├── notification-context.tsx # Notification provider
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
└── scripts/                # Utility scripts
```

## Responsive Design

The application is fully responsive across all device sizes:

- **Mobile (< 768px):** Collapsible sidebar, optimized layout, touch-friendly buttons
- **Tablet (768px - 1024px):** Hybrid navigation, adjusted grid layouts
- **Desktop (> 1024px):** Full sidebar, multi-column grids, rich data visualizations

## Key Components

### RiskBadge
Displays student risk level with color-coded visual indicators:
- Low (Green)
- Medium (Yellow)
- High (Orange)
- Critical (Red)

### StatCard
Shows key statistics with optional trend indicators and icons:
- Customizable title, value, and description
- Trend indicators (up/down)
- Icon support for visual enhancement

### DataTable
Sortable table component with:
- Column-based sorting
- Custom cell rendering
- Responsive overflow handling
- Click handlers for row selection

### Sidebar
Mobile-responsive navigation with:
- Collapsible drawer on mobile
- Active route highlighting
- Smooth transitions
- Quick logout access

### Header
Sticky page header with:
- Dynamic page titles
- Search functionality
- Notification bell with indicator
- Settings access
- Fully responsive design

## API Integration

The application expects a REST API with the following endpoints:

```
GET  /api/dashboard/analytics      - Dashboard metrics
GET  /api/students                 - Student list with pagination
GET  /api/students/:id             - Student details
GET  /api/students/:id/risk-factors - Risk factor analysis
GET  /api/students/:id/attendance  - Attendance records
GET  /api/students/:id/academic    - Academic performance
GET  /api/students/:id/engagement  - Engagement metrics
GET  /api/analytics                - Analytics data
GET  /api/alerts                   - Alerts list
POST /api/upload/students          - Bulk student upload
GET  /api/settings                 - Settings
POST /api/settings                 - Update settings
```

## Environment Variables

Create a `.env.local` file with:

```
VITE_API_URL=http://localhost:3000/api
```

## Installation & Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Color Scheme

The application uses a professional dark/light theme with:
- Primary color: Indigo (Risk and actionable items)
- Accent colors: Blue, Green, Amber, Red (Status indicators)
- Neutral colors: Gray scale for backgrounds and text
- High contrast for accessibility

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- CSS-in-JS for optimized stylesheets
- Caching strategies for API responses
- Mobile-first responsive design

## Accessibility

- Semantic HTML structure
- ARIA labels and roles where needed
- Keyboard navigation support
- High contrast color combinations
- Focus indicators for interactive elements
- Screen reader friendly components

## Future Enhancements

- Real-time notification system with WebSockets
- Advanced filtering and faceted search
- Export to PDF/Excel functionality
- Integration with school information systems (SIS)
- Machine learning-based risk prediction
- Automated intervention recommendations
- Parent/student portal access
- Multi-language support
- API rate limiting and security enhancements

## License

This project is part of the v0 platform by Vercel.

## Support

For issues or questions, please contact support or open an issue in the project repository.
