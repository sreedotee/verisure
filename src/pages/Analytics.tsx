import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, PieChart, TrendingUp, ShieldCheck, ShieldX, Eye, Package } from "lucide-react";
import { getAnalytics } from "@/lib/productService";

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    realCount: 0,
    fakeCount: 0,
    totalCount: 0,
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const data = await getAnalytics();
    setAnalytics(data);
    setLoading(false);
  };

  const authenticity_rate = analytics.totalCount > 0 ? (analytics.realCount / analytics.totalCount) * 100 : 0;
  const fake_rate = analytics.totalCount > 0 ? (analytics.fakeCount / analytics.totalCount) * 100 : 0;

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
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : analytics.totalCount}</div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Real</CardTitle>
              <ShieldCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{loading ? "..." : analytics.realCount}</div>
              <p className="text-xs text-muted-foreground">
                {loading ? "..." : `${authenticity_rate.toFixed(1)}% authenticity rate`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detected Fakes</CardTitle>
              <ShieldX className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{loading ? "..." : analytics.fakeCount}</div>
              <p className="text-xs text-muted-foreground">
                {loading ? "..." : `${fake_rate.toFixed(1)}% of total products`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {loading ? "..." : `${authenticity_rate.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Products verified as real
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
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading analytics...</p>
                </div>
              ) : analytics.totalCount > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Real Products</span>
                      <span className="font-medium">{authenticity_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={authenticity_rate} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fake Products</span>
                      <span className="font-medium">{fake_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={fake_rate} className="h-2" />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-success">{analytics.realCount}</div>
                        <div className="text-sm text-muted-foreground">Authentic</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-destructive">{analytics.fakeCount}</div>
                        <div className="text-sm text-muted-foreground">Counterfeit</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No products registered yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Registration Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Registration Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading trends...</p>
                </div>
              ) : analytics.recentProducts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentProducts.map((data: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{data.date}</span>
                        <span>{data.count} products</span>
                      </div>
                      <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-success h-full transition-all duration-300"
                          style={{ width: `${data.count > 0 ? (data.real / data.count) * 100 : 0}%` }}
                        />
                        <div 
                          className="bg-destructive h-full transition-all duration-300"
                          style={{ width: `${data.count > 0 ? (data.fake / data.count) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Real: {data.real}</span>
                        <span>Fake: {data.fake}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No activity data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              System Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Current status and performance metrics
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-xs text-muted-foreground">All services running</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold mb-1">{loading ? "..." : analytics.totalCount}</div>
                <p className="text-sm font-medium">Total Registrations</p>
                <p className="text-xs text-muted-foreground">Products in database</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-success mb-1">
                  {loading ? "..." : `${authenticity_rate.toFixed(0)}%`}
                </div>
                <p className="text-sm font-medium">Trust Score</p>
                <p className="text-xs text-muted-foreground">Platform reliability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;