// ============================================================
// CHARTS COMPONENT — Using Recharts (UMD global)
// ============================================================

// Safely destructure from the global Recharts object
const _RC = window.Recharts || {};
const BarChart = _RC.BarChart;
const Bar = _RC.Bar;
const XAxis = _RC.XAxis;
const YAxis = _RC.YAxis;
const CartesianGrid = _RC.CartesianGrid;
const Tooltip = _RC.Tooltip;
const Legend = _RC.Legend;
const PieChart = _RC.PieChart;
const Pie = _RC.Pie;
const Cell = _RC.Cell;
const LineChart = _RC.LineChart;
const Line = _RC.Line;
const ResponsiveContainer = _RC.ResponsiveContainer;
const AreaChart = _RC.AreaChart;
const Area = _RC.Area;

const CHART_COLORS = ['#1A1F36', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'];

// Custom tooltip
const CustomTooltip = ({ active, payload, label, isCurrency }) => {
    if (active && payload && payload.length) {
        return React.createElement('div', {
            style: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
        },
            label && React.createElement('p', { style: { fontSize: 12, color: '#64748B', marginBottom: 6 } }, label),
            ...payload.map((p, i) =>
                React.createElement('p', { key: i, style: { fontSize: 13, fontWeight: 600, color: p.color || '#1A1F36' } },
                    `${p.name}: ${isCurrency ? formatCurrency(p.value) : p.value}`
                )
            )
        );
    }
    return null;
};

// Safe chart render - returns empty div if Recharts not loaded
const safeChart = (fn) => {
    try {
        if (!window.Recharts || !ResponsiveContainer) {
            return React.createElement('div', { style: { padding: 20, textAlign: 'center', color: '#94A3B8', fontSize: 13 } }, 'Loading chart...');
        }
        return fn();
    } catch (e) {
        console.error('Chart error:', e);
        return React.createElement('div', { style: { padding: 20, textAlign: 'center', color: '#EF4444', fontSize: 13 } }, 'Chart unavailable');
    }
};

// Bar Chart
window.CRMBarChart = ({ data, xKey, bars, height = 280, isCurrency = false }) => {
    return safeChart(() =>
        React.createElement(ResponsiveContainer, { width: '100%', height },
            React.createElement(BarChart, { data, margin: { top: 5, right: 10, left: 10, bottom: 5 } },
                React.createElement(CartesianGrid, { strokeDasharray: '3 3', stroke: '#F1F5F9' }),
                React.createElement(XAxis, { dataKey: xKey, tick: { fontSize: 11, fill: '#64748B' }, axisLine: false, tickLine: false }),
                React.createElement(YAxis, {
                    tick: { fontSize: 11, fill: '#64748B' }, axisLine: false, tickLine: false,
                    tickFormatter: isCurrency ? (v) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) : undefined
                }),
                React.createElement(Tooltip, { content: (props) => React.createElement(CustomTooltip, { ...props, isCurrency }) }),
                React.createElement(Legend, { wrapperStyle: { fontSize: 12 } }),
                ...bars.map((b, i) =>
                    React.createElement(Bar, { key: b.key, dataKey: b.key, name: b.name || b.key, fill: b.color || CHART_COLORS[i], radius: [4, 4, 0, 0], maxBarSize: 50 })
                )
            )
        )
    );
};

// Pie/Donut Chart
window.CRMPieChart = ({ data, height = 280, donut = false }) => {
    return safeChart(() =>
        React.createElement(ResponsiveContainer, { width: '100%', height },
            React.createElement(PieChart, null,
                React.createElement(Pie, {
                    data,
                    cx: '50%', cy: '45%',
                    innerRadius: donut ? '50%' : 0,
                    outerRadius: '70%',
                    dataKey: 'value',
                    label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
                    labelLine: true,
                },
                    ...data.map((entry, i) =>
                        React.createElement(Cell, { key: i, fill: entry.color || CHART_COLORS[i] })
                    )
                ),
                React.createElement(Tooltip, { formatter: (v) => formatCurrency(v) }),
                React.createElement(Legend, { wrapperStyle: { fontSize: 12 } })
            )
        )
    );
};

// Line/Area Chart
window.CRMLineChart = ({ data, xKey, lines, height = 280, isCurrency = false, area = false }) => {
    return safeChart(() => {
        const ChartComp = area ? AreaChart : LineChart;
        return React.createElement(ResponsiveContainer, { width: '100%', height },
            React.createElement(ChartComp, { data, margin: { top: 5, right: 10, left: 10, bottom: 5 } },
                React.createElement(CartesianGrid, { strokeDasharray: '3 3', stroke: '#F1F5F9' }),
                React.createElement(XAxis, { dataKey: xKey, tick: { fontSize: 11, fill: '#64748B' }, axisLine: false, tickLine: false }),
                React.createElement(YAxis, {
                    tick: { fontSize: 11, fill: '#64748B' }, axisLine: false, tickLine: false,
                    tickFormatter: isCurrency ? (v) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) : undefined
                }),
                React.createElement(Tooltip, { content: (props) => React.createElement(CustomTooltip, { ...props, isCurrency }) }),
                React.createElement(Legend, { wrapperStyle: { fontSize: 12 } }),
                ...lines.map((l, i) => {
                    if (area) {
                        return React.createElement(Area, {
                            key: l.key, type: 'monotone', dataKey: l.key, name: l.name || l.key,
                            stroke: l.color || CHART_COLORS[i], fill: (l.color || CHART_COLORS[i]) + '20',
                            strokeWidth: 2, dot: { r: 4 }
                        });
                    }
                    return React.createElement(Line, {
                        key: l.key, type: 'monotone', dataKey: l.key, name: l.name || l.key,
                        stroke: l.color || CHART_COLORS[i], strokeWidth: 2, dot: { r: 4 }
                    });
                })
            )
        );
    });
};

