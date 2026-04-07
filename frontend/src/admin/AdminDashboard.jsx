import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Paper, Typography, Button, Chip,
  Table, TableHead, TableRow, TableCell, TableBody,
  Avatar, CircularProgress, LinearProgress,
  useMediaQuery, useTheme,
} from "@mui/material";
import {
  CurrencyRupee, Receipt, Inventory,
  Warning, TrendingUp, ShoppingCart, AddCircle,
  Category, ListAlt, People, EmojiEvents,
} from "@mui/icons-material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const BLUE  = "#0B2A4A";
const RED   = "#C4161C";
const LIGHT = "#f4f6f9";

/* ======================================================
   STAT CARD
====================================================== */
const StatCard = ({ title, value, icon, gradient, sub, delay = 0 }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 2.5 },
      borderRadius: 3,
      background: gradient,
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      animation: `fadeUp 0.5s ease both`,
      animationDelay: `${delay}ms`,
      "@keyframes fadeUp": {
        from: { opacity: 0, transform: "translateY(20px)" },
        to:   { opacity: 1, transform: "translateY(0)" },
      },
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
        transition: "all 0.25s ease",
      },
      transition: "all 0.25s ease",
    }}
  >
    <Box sx={{
      position: "absolute", right: -18, top: -18,
      width: 90, height: 90, borderRadius: "50%",
      background: "rgba(255,255,255,0.1)",
    }} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography sx={{ fontSize: { xs: 12, md: 13 }, fontWeight: 600, opacity: 0.85, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: { xs: 20, md: 26 }, fontWeight: 800, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: 12, opacity: 0.8, mt: 0.5 }}>{sub}</Typography>
        )}
      </Box>
      <Box sx={{
        bgcolor: "rgba(255,255,255,0.2)", borderRadius: 2, p: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

/* ======================================================
   QUICK ACTION
====================================================== */
const QuickAction = ({ label, icon, color, onClick }) => (
  <Button
    onClick={onClick}
    startIcon={icon}
    variant="contained"
    size="small"
    sx={{
      bgcolor: color, borderRadius: 2, fontWeight: 700,
      fontSize: { xs: 12, md: 13 },
      px: { xs: 1.5, md: 2.5 },
      py: { xs: 1, md: 1.2 },
      boxShadow: "none",
      "&:hover": {
        bgcolor: color,
        filter: "brightness(0.88)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        transform: "translateY(-2px)",
      },
      transition: "all 0.2s ease",
    }}
  >
    {label}
  </Button>
);

/* ======================================================
   MAIN DASHBOARD
====================================================== */
const AdminDashboard = () => {
  const { token, name } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: RED }} />
    </Box>
  );

  if (!data) return null;

  const paymentChip = (bill) => {
    if (bill.pendingAmount === 0)
      return <Chip label="Paid" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700, fontSize: 11 }} />;
    if (bill.paidAmount === 0)
      return <Chip label="Unpaid" size="small" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 700, fontSize: 11 }} />;
    return <Chip label="Partial" size="small" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: 700, fontSize: 11 }} />;
  };

  const maxQty = data.topProducts?.[0]?.totalQty || 1;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: LIGHT, minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 800, color: BLUE }}>
          Welcome back, {name || "Admin"} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, md: 14 } }}>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
          })}
        </Typography>
      </Box>

      {/* ── STAT CARDS (row 1) ── */}
      <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 1.5, md: 2 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${(data.totalRevenue || 0).toLocaleString()}`}
            icon={<CurrencyRupee sx={{ fontSize: { xs: 22, md: 28 } }} />}
            gradient={`linear-gradient(135deg, ${BLUE}, #1a4a7a)`}
            sub={`${data.totalBills} bills`}
            delay={0}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Pending Payments"
            value={`₹${(data.totalPendingPayments || 0).toLocaleString()}`}
            icon={<Warning sx={{ fontSize: { xs: 22, md: 28 } }} />}
            gradient="linear-gradient(135deg, #e65100, #ff8f00)"
            sub="Across all bills"
            delay={80}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={data.totalOrders || 0}
            icon={<ShoppingCart sx={{ fontSize: { xs: 22, md: 28 } }} />}
            gradient={`linear-gradient(135deg, ${RED}, #a51218)`}
            sub={`${data.pendingOrders} pending`}
            delay={160}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={data.totalProducts || 0}
            icon={<Inventory sx={{ fontSize: { xs: 22, md: 28 } }} />}
            gradient="linear-gradient(135deg, #00695c, #00897b)"
            sub={`${data.lowStockProducts?.length || 0} low stock`}
            delay={240}
          />
        </Grid>
      </Grid>

      {/* ── STAT CARDS (row 2 — today + monthly) ── */}
      <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 1.5, md: 2 } }}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Today's Revenue"
            value={`₹${(data.todayRevenue || 0).toLocaleString()}`}
            icon={<CurrencyRupee sx={{ fontSize: { xs: 22, md: 28 } }} />}
            gradient="linear-gradient(135deg, #1b5e20, #2e7d32)"
            delay={320}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`₹${(data.monthRevenue || 0).toLocaleString()}`}
            icon={<TrendingUp sx={{ fontSize: { xs: 22, md: 28 } }} />}
            gradient="linear-gradient(135deg, #4a148c, #7b1fa2)"
            delay={400}
          />
        </Grid>
      </Grid>

      {/* ── QUICK ACTIONS ── */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, mb: { xs: 1.5, md: 2 }, bgcolor: "#fff" }}>
        <Typography sx={{ fontWeight: 700, color: BLUE, mb: 1.5, fontSize: { xs: 13, md: 15 } }}>
          ⚡ Quick Actions
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1, md: 1.5 } }}>
          <QuickAction label="New Bill"     icon={<Receipt fontSize="small" />}      color={RED}      onClick={() => navigate("/admin/billing")} />
          <QuickAction label="Add Product"  icon={<AddCircle fontSize="small" />}    color={BLUE}     onClick={() => navigate("/admin/products")} />
          <QuickAction label="Orders"       icon={<ShoppingCart fontSize="small" />} color="#2e7d32"  onClick={() => navigate("/admin/orders")} />
          <QuickAction label="Master List"  icon={<People fontSize="small" />}       color="#6a1b9a"  onClick={() => navigate("/admin/master-list")} />
          <QuickAction label="Categories"   icon={<Category fontSize="small" />}     color="#0277bd"  onClick={() => navigate("/admin/categories")} />
          <QuickAction label="Bill History" icon={<ListAlt fontSize="small" />}      color="#e65100"  onClick={() => navigate("/admin/billing-history")} />
        </Box>
      </Paper>

      {/* ── SALES GRAPH ── */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, mb: { xs: 1.5, md: 2 }, bgcolor: "#fff" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <TrendingUp sx={{ color: RED, fontSize: { xs: 18, md: 20 } }} />
          <Typography sx={{ fontWeight: 700, color: BLUE, fontSize: { xs: 13, md: 15 } }}>
            Sales Overview
          </Typography>
        </Box>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.salesGraph || []} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#888" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#888" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v.toLocaleString()}`}
            />
            <Tooltip
              formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={RED}
              strokeWidth={2.5}
              dot={{ r: 3, fill: RED, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* ── TOP PRODUCTS + LOW STOCK ── */}
      <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 1.5, md: 2 } }}>

        {/* TOP PRODUCTS */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: "#fff", height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TrendingUp sx={{ color: RED, fontSize: { xs: 18, md: 20 } }} />
              <Typography sx={{ fontWeight: 700, color: BLUE, fontSize: { xs: 13, md: 15 } }}>
                Top Selling Products
              </Typography>
            </Box>
            {data.topProducts?.length === 0 ? (
              <Typography color="text.secondary" fontSize={13}>No billing data yet</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {data.topProducts?.map((p, i) => (
                  <Box key={p.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 }, mb: 0.5 }}>
                      <Avatar
                        src={p.image}
                        variant="rounded"
                        sx={{ width: { xs: 28, md: 36 }, height: { xs: 28, md: 36 }, bgcolor: "#f0f0f0", flexShrink: 0 }}
                      >
                        {p.title?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography fontSize={{ xs: 12, md: 13 }} fontWeight={700} noWrap color={BLUE}>
                            {i + 1}. {p.title}
                          </Typography>
                          <Typography fontSize={{ xs: 11, md: 12 }} fontWeight={700} color={RED} sx={{ ml: 1, whiteSpace: "nowrap" }}>
                            {p.totalQty} units
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(p.totalQty / maxQty) * 100}
                          sx={{
                            mt: 0.5, height: 5, borderRadius: 5, bgcolor: "#f0f0f0",
                            "& .MuiLinearProgress-bar": { bgcolor: i === 0 ? RED : BLUE },
                          }}
                        />
                      </Box>
                      {!isMobile && (
                        <Typography fontSize={12} color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                          ₹{p.totalRevenue.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* LOW STOCK */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: "#fff", height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Warning sx={{ color: "#e65100", fontSize: { xs: 18, md: 20 } }} />
              <Typography sx={{ fontWeight: 700, color: BLUE, fontSize: { xs: 13, md: 15 } }}>
                Low Stock Alert
              </Typography>
              {data.lowStockProducts?.length > 0 && (
                <Chip
                  label={data.lowStockProducts.length}
                  size="small"
                  sx={{ bgcolor: "#ffebee", color: RED, fontWeight: 800, ml: "auto" }}
                />
              )}
            </Box>
            {data.lowStockProducts?.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography fontSize={28}>✅</Typography>
                <Typography fontSize={13} color="text.secondary" mt={1}>All products well stocked</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {data.lowStockProducts?.map((p) => (
                  <Box key={p._id} sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    p: 1, borderRadius: 2,
                    bgcolor: p.stock === 0 ? "#ffebee" : "#fff8e1",
                    border: `1px solid ${p.stock === 0 ? "#ffcdd2" : "#ffe082"}`,
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar src={p.image} variant="rounded" sx={{ width: 30, height: 30, bgcolor: "#f0f0f0" }}>
                        {p.title?.charAt(0)}
                      </Avatar>
                      <Typography fontSize={{ xs: 12, md: 13 }} fontWeight={600} noWrap sx={{ maxWidth: { xs: 100, md: 150 } }}>
                        {p.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: 11, bgcolor: p.stock === 0 ? RED : "#ff8f00", color: "#fff", flexShrink: 0 }}
                    />
                  </Box>
                ))}
                <Button size="small" onClick={() => navigate("/admin/products")}
                  sx={{ mt: 1, color: BLUE, fontWeight: 700, fontSize: 12 }}>
                  Manage Stock →
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ── TOP CUSTOMERS ── */}
      {data.topCustomers?.length > 0 && (
        <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, mb: { xs: 1.5, md: 2 }, bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <EmojiEvents sx={{ color: "#f57f17", fontSize: { xs: 18, md: 20 } }} />
            <Typography sx={{ fontWeight: 700, color: BLUE, fontSize: { xs: 13, md: 15 } }}>
              Top Customers
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {data.topCustomers.map((c, i) => (
              <Box key={i} sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                p: { xs: 1, md: 1.5 }, borderRadius: 2,
                bgcolor: i === 0 ? "#fff8e1" : "#fafafa",
                border: `1px solid ${i === 0 ? "#ffe082" : "#f0f0f0"}`,
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{
                    width: 32, height: 32,
                    bgcolor: i === 0 ? "#f57f17" : i === 1 ? "#9e9e9e" : i === 2 ? "#795548" : BLUE,
                    fontSize: 13, fontWeight: 800,
                  }}>
                    {i + 1}
                  </Avatar>
                  <Typography fontSize={{ xs: 12, md: 13 }} fontWeight={600} color={BLUE}>
                    {c.name}
                  </Typography>
                </Box>
                <Typography fontSize={{ xs: 12, md: 13 }} fontWeight={700} color={RED}>
                  ₹{(c.total || 0).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* ── RECENT BILLS ── */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: "#fff" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Receipt sx={{ color: RED, fontSize: { xs: 18, md: 20 } }} />
            <Typography sx={{ fontWeight: 700, color: BLUE, fontSize: { xs: 13, md: 15 } }}>
              Recent Bills
            </Typography>
          </Box>
          <Button size="small" onClick={() => navigate("/admin/billing-history")}
            sx={{ color: RED, fontWeight: 700, fontSize: 12 }}>
            View All →
          </Button>
        </Box>
        {data.recentBills?.length === 0 ? (
          <Typography color="text.secondary" fontSize={13}>No bills yet</Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: { xs: 500, md: "100%" } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                  {(isMobile
                    ? ["Invoice", "Customer", "Amount", "Status"]
                    : ["Invoice", "Customer", "Amount", "Paid", "Pending", "Status", "Date"]
                  ).map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: BLUE, fontSize: 12, border: "none" }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recentBills?.map((bill) => (
                  <TableRow key={bill._id} hover sx={{ "& td": { border: "none", fontSize: { xs: 12, md: 13 } } }}>
                    <TableCell sx={{ fontWeight: 700, color: BLUE }}>#{bill.invoiceNumber}</TableCell>
                    <TableCell>
                      <Typography noWrap fontSize={{ xs: 12, md: 13 }}>{bill.customerName}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>₹{bill.totalAmount}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell sx={{ color: "#2e7d32", fontWeight: 600 }}>₹{bill.paidAmount}</TableCell>
                        <TableCell sx={{ color: bill.pendingAmount > 0 ? RED : "#2e7d32", fontWeight: 600 }}>
                          ₹{bill.pendingAmount}
                        </TableCell>
                      </>
                    )}
                    <TableCell>{paymentChip(bill)}</TableCell>
                    {!isMobile && (
                      <TableCell sx={{ color: "#888", whiteSpace: "nowrap" }}>
                        {new Date(bill.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

    </Box>
  );
};

export default AdminDashboard;