import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, PieChart, TrendingUp, TrendingDown, ShieldCheck, ShieldX, Eye, Users } from "lucide-react";

const Analytics = () => {
  const stats = {
    totalProducts: 1247,
    realProducts: 1089,
    fakeProducts: 158,
    verificationScans: 4523,
    trendsData: {
      realPercentage: 87.3,
      fakePercentage: 12.7,
      weeklyGrowth: 5.2,
      monthlyScans: 12847
    }
  };

  const monthlyData = [
    { month: 'Jan', real: 245, fake: 23 },
    { month: 'Feb', real: 312, fake: 31 },
    { month: 'Mar', real: 287, fake: 19 },
    { month: 'Apr', real: 341, fake: 42 },
    { month: 'May', real: 398, fake: 28 },
    { month: 'Jun', real: 423, fake: 35 }
  ];

  const recentActivity = [
    { action: 'Product verified as Real', product: 'Nike AirMax Pro', time: '2 minutes ago' },
    { action: 'Counterfeit detected', product: 'Fake Rolex Watch', time: '5 minutes ago' },
    { action: 'New product registered', product: 'Adidas Running Shoes', time: '12 minutes ago' },
    { action: 'Product verified as Real', product: 'Levi\'s Denim Jacket', time: '18 minutes ago' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor authenticity verification trends and system performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +{stats.trendsData.weeklyGrowth}% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Real</CardTitle>
              <ShieldCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.realProducts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.trendsData.realPercentage}% authenticity rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detected Fakes</CardTitle>
              <ShieldX className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.fakeProducts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.trendsData.fakePercentage}% of total products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verificationScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.trendsData.monthlyScans.toLocaleString()} this month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Authenticity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Authenticity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Real Products</span>
                    <span className="font-medium">{stats.trendsData.realPercentage}%</span>
                  </div>
                  <Progress value={stats.trendsData.realPercentage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fake Products</span>
                    <span className="font-medium">{stats.trendsData.fakePercentage}%</span>
                  </div>
                  <Progress value={stats.trendsData.fakePercentage} className="h-2" />
                </div>
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-success">{stats.realProducts}</div>
                      <div className="text-sm text-muted-foreground">Authentic</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-destructive">{stats.fakeProducts}</div>
                      <div className="text-sm text-muted-foreground">Counterfeit</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Monthly Detection Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={data.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{data.month}</span>
                      <span>{data.real + data.fake} products</span>
                    </div>
                    <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="bg-success h-full transition-all duration-300"
                        style={{ width: `${(data.real / (data.real + data.fake)) * 100}%` }}
                      />
                      <div 
                        className="bg-destructive h-full transition-all duration-300"
                        style={{ width: `${(data.fake / (data.real + data.fake)) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Real: {data.real}</span>
                      <span>Fake: {data.fake}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest verification and registration activities across the platform
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {activity.action.includes('Real') ? (
                      <ShieldCheck className="h-4 w-4 text-success" />
                    ) : activity.action.includes('Counterfeit') ? (
                      <ShieldX className="h-4 w-4 text-destructive" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-primary" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.product}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;