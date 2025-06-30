
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIEnhancedFinance } from '@/components/ai/ai-enhanced-finance';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  FileText,
  AlertCircle,
  Plus,
  Filter,
  Download,
  Euro,
  Brain,
  Sparkles,
  PieChart,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3'];

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setTransactions([
        { id: 1, description: 'Kundenrechnung #001', amount: 2500, type: 'INCOME', date: '2024-03-15' },
        { id: 2, description: 'Büroausstattung', amount: -450, type: 'EXPENSE', date: '2024-03-14' },
        { id: 3, description: 'Software-Lizenz', amount: -299, type: 'EXPENSE', date: '2024-03-13' },
        { id: 4, description: 'Beratungsleistung', amount: 1800, type: 'INCOME', date: '2024-03-12' },
        { id: 5, description: 'Marketing-Kampagne', amount: -650, type: 'EXPENSE', date: '2024-03-11' }
      ]);

      setInvoices([
        { id: 1, number: 'INV-001', amount: 2500, status: 'PAID', customer: 'Müller GmbH' },
        { id: 2, number: 'INV-002', amount: 1800, status: 'SENT', customer: 'Weber AG' },
        { id: 3, number: 'INV-003', amount: 3200, status: 'OVERDUE', customer: 'Schmidt KG' },
        { id: 4, number: 'INV-004', amount: 950, status: 'DRAFT', customer: 'Fischer GmbH' }
      ]);
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data
  const cashflowData = [
    { month: 'Jan', income: 15000, expenses: 12000 },
    { month: 'Feb', income: 18000, expenses: 13500 },
    { month: 'Mär', income: 22000, expenses: 15000 },
    { month: 'Apr', income: 25000, expenses: 16500 },
    { month: 'Mai', income: 28000, expenses: 18000 },
    { month: 'Jun', income: 32000, expenses: 19500 }
  ];

  const expenseCategories = [
    { name: 'Marketing', value: 4500, fill: COLORS[0] },
    { name: 'Personal', value: 8200, fill: COLORS[1] },
    { name: 'IT & Software', value: 2800, fill: COLORS[2] },
    { name: 'Büro & Ausstattung', value: 1900, fill: COLORS[3] },
    { name: 'Sonstiges', value: 1200, fill: COLORS[4] }
  ];

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0));

  const netProfit = totalIncome - totalExpenses;

  const kpiCards = [
    {
      title: 'Gesamtumsatz',
      value: `€${totalIncome.toLocaleString('de-DE')}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Euro,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Ausgaben',
      value: `€${totalExpenses.toLocaleString('de-DE')}`,
      change: '+8.2%',
      changeType: 'negative' as const,
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Nettogewinn',
      value: `€${netProfit.toLocaleString('de-DE')}`,
      change: '+15.8%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Offene Rechnungen',
      value: invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').length.toString(),
      change: '-5.2%',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Finanzübersicht, Cashflow-Management und KI-gestützte Finanzanalyse
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Neue Rechnung
          </Button>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Finanzübersicht
          </TabsTrigger>
          <TabsTrigger value="ai-enhanced" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            KI-Enhanced Finance
            <Badge variant="secondary" className="ml-1">
              <Sparkles className="w-3 h-3 mr-1" />
              AI
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Module
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                          <div className="flex items-center mt-2">
                            {kpi.changeType === 'positive' ? (
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm ${
                              kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {kpi.change}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">vs. letzter Monat</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                          <Icon className={`h-6 w-6 ${kpi.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cashflow Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Cashflow-Entwicklung
                  </CardTitle>
                  <CardDescription>
                    Einnahmen vs. Ausgaben über die Zeit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={cashflowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`€${value}`, '']}
                        labelStyle={{ fontSize: 12 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stackId="1" 
                        stroke={COLORS[1]} 
                        fill={COLORS[1]}
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stackId="2" 
                        stroke={COLORS[0]} 
                        fill={COLORS[0]}
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Expense Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Ausgaben-Kategorien
                  </CardTitle>
                  <CardDescription>
                    Verteilung der monatlichen Ausgaben
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`€${value}`, 'Betrag']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {expenseCategories.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-sm text-gray-600">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Letzte Transaktionen</CardTitle>
                <CardDescription>
                  Übersicht der neuesten Ein- und Ausgaben
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'INCOME' ? (
                            <TrendingUp className={`h-4 w-4 text-green-600`} />
                          ) : (
                            <TrendingDown className={`h-4 w-4 text-red-600`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'INCOME' ? '+' : ''}€{Math.abs(transaction.amount).toLocaleString('de-DE')}
                        </p>
                        <Badge variant={transaction.type === 'INCOME' ? 'default' : 'secondary'} className="text-xs">
                          {transaction.type === 'INCOME' ? 'Einnahme' : 'Ausgabe'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="ai-enhanced" className="space-y-6">
          <AIEnhancedFinance />
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Rechnungen</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Erstellen und verwalten Sie Rechnungen
                </p>
                <Button size="sm" className="w-full">
                  Öffnen
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Transaktionen</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ein- und Ausgaben verwalten
                </p>
                <Button size="sm" className="w-full">
                  Öffnen
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <PieChart className="h-8 w-8 mx-auto mb-4 text-purple-500" />
                <h3 className="font-semibold mb-2">Budgets</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Budget-Planung und -Überwachung
                </p>
                <Button size="sm" className="w-full">
                  Öffnen
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-4 text-orange-500" />
                <h3 className="font-semibold mb-2">Berichte</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Finanzberichte und Analysen
                </p>
                <Button size="sm" className="w-full">
                  Öffnen
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
