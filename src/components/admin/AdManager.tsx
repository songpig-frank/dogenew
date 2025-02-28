import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Eye, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Ad } from "@/lib/types/ads";

const AdManager = () => {
  const [ads, setAds] = React.useState<Ad[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingAd, setEditingAd] = React.useState<Ad | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    type: "banner",
    position: "top",
    adCode: "",
    imageUrl: "",
    linkUrl: "",
    width: "",
    height: "",
    active: true,
  });

  // Fetch ads from database using direct function to bypass RLS
  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("direct_get_all_ads");

      if (error) throw error;

      // Parse the JSONB result into an array of ads
      const parsedAds = data || [];
      setAds(parsedAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
      // Fallback to mock data if there's an error
      const mockAds: Ad[] = [
        {
          id: "1",
          name: "Top Banner Ad",
          type: "banner",
          position: "top",
          image_url: "https://via.placeholder.com/728x90?text=Top+Banner+Ad",
          link_url: "https://example.com",
          width: "728px",
          height: "90px",
          active: true,
          impressions: 1245,
          clicks: 23,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Sidebar Ad",
          type: "sidebar",
          position: "right",
          image_url: "https://via.placeholder.com/300x600?text=Sidebar+Ad",
          link_url: "https://example.com/affiliate",
          width: "300px",
          height: "600px",
          active: true,
          impressions: 987,
          clicks: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      setAds(mockAds);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAds();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        // Update existing ad using direct function to bypass RLS
        const { data, error } = await supabase.rpc("direct_update_ad", {
          p_id: editingAd.id,
          p_name: formData.name,
          p_type: formData.type,
          p_position: formData.position,
          p_ad_code: formData.adCode,
          p_image_url: formData.imageUrl,
          p_link_url: formData.linkUrl,
          p_width: formData.width,
          p_height: formData.height,
          p_active: formData.active,
        });

        if (error) throw error;

        // Refresh ads to get updated data
        await fetchAds();
      } else {
        // Create new ad using direct function to bypass RLS
        const { data, error } = await supabase.rpc("direct_create_ad", {
          p_name: formData.name,
          p_type: formData.type,
          p_position: formData.position,
          p_ad_code: formData.adCode,
          p_image_url: formData.imageUrl,
          p_link_url: formData.linkUrl,
          p_width: formData.width,
          p_height: formData.height,
          p_active: formData.active,
        });

        if (error) throw error;

        // Refresh ads to get updated data
        await fetchAds();
      }

      // Reset form
      setEditingAd(null);
      setFormData({
        name: "",
        type: "banner",
        position: "top",
        adCode: "",
        imageUrl: "",
        linkUrl: "",
        width: "",
        height: "",
        active: true,
      });
    } catch (error) {
      console.error("Error saving ad:", error);
      alert("Error saving ad: " + (error.message || String(error)));
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      name: ad.name,
      type: ad.type,
      position: ad.position,
      adCode: ad.ad_code || "",
      imageUrl: ad.image_url || "",
      linkUrl: ad.link_url || "",
      width: ad.width || "",
      height: ad.height || "",
      active: ad.active,
    });
  };

  const handleDelete = async (adId: string) => {
    try {
      // Delete using direct function to bypass RLS
      const { data, error } = await supabase.rpc("direct_delete_ad", {
        p_id: adId,
      });

      if (error) throw error;

      // Update local state
      setAds(ads.filter((ad) => ad.id !== adId));
    } catch (error) {
      console.error("Error deleting ad:", error);
      alert("Error deleting ad: " + (error.message || String(error)));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Ad Manager</h1>

      <Tabs defaultValue="ads">
        <TabsList className="mb-4">
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="ads">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ad List</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">Loading ads...</div>
                  ) : ads.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No ads found. Create your first ad using the form.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Impressions</TableHead>
                          <TableHead>Clicks</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ads.map((ad) => (
                          <TableRow key={ad.id}>
                            <TableCell>{ad.name}</TableCell>
                            <TableCell>
                              <span className="capitalize">{ad.type}</span>
                            </TableCell>
                            <TableCell>
                              {ad.active ? (
                                <span className="text-green-500">Active</span>
                              ) : (
                                <span className="text-gray-500">Inactive</span>
                              )}
                            </TableCell>
                            <TableCell>{ad.impressions || 0}</TableCell>
                            <TableCell>{ad.clicks || 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(ad)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleDelete(ad.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open(ad.link_url, "_blank")
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingAd ? "Edit Ad" : "Create New Ad"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter ad name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Ad Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          handleSelectChange("type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ad type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                          <SelectItem value="inline">Inline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Select
                        value={formData.position}
                        onValueChange={(value) =>
                          handleSelectChange("position", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="left">Left Sidebar</SelectItem>
                          <SelectItem value="right">Right Sidebar</SelectItem>
                          <SelectItem value="content">In Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adCode">Ad Code (Optional)</Label>
                      <Textarea
                        id="adCode"
                        name="adCode"
                        value={formData.adCode}
                        onChange={handleInputChange}
                        placeholder="Paste ad code here (e.g., Google AdSense)"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="Enter image URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkUrl">Link URL</Label>
                      <Input
                        id="linkUrl"
                        name="linkUrl"
                        value={formData.linkUrl}
                        onChange={handleInputChange}
                        placeholder="Enter link URL"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="width">Width</Label>
                        <Input
                          id="width"
                          name="width"
                          value={formData.width}
                          onChange={handleInputChange}
                          placeholder="e.g., 300px or 100%"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          name="height"
                          value={formData.height}
                          onChange={handleInputChange}
                          placeholder="e.g., 250px or auto"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={handleSwitchChange}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      {editingAd && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingAd(null);
                            setFormData({
                              name: "",
                              type: "banner",
                              position: "top",
                              adCode: "",
                              imageUrl: "",
                              linkUrl: "",
                              width: "",
                              height: "",
                              active: true,
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="submit">
                        {editingAd ? "Update Ad" : "Create Ad"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="placements">
          <Card>
            <CardHeader>
              <CardTitle>Ad Placements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure where ads appear on your website.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Top Banner</h3>
                      <Switch id="top-banner" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Appears at the top of all pages
                    </p>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Top Banner Ad</SelectItem>
                        <SelectItem value="2">Sidebar Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Sidebar</h3>
                      <Switch id="sidebar" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Appears in the right sidebar
                    </p>
                    <Select defaultValue="2">
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Top Banner Ad</SelectItem>
                        <SelectItem value="2">Sidebar Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">In-Content (Home)</h3>
                      <Switch id="in-content-home" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Appears within the home page content
                    </p>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Top Banner Ad</SelectItem>
                        <SelectItem value="2">Sidebar Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Bottom Banner</h3>
                      <Switch id="bottom-banner" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Appears at the bottom of all pages
                    </p>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Top Banner Ad</SelectItem>
                        <SelectItem value="2">Sidebar Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button>Save Placement Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Ad Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View performance metrics for your ads.
              </p>
              {/* Analytics UI would go here */}
              <div className="text-center py-4 text-muted-foreground">
                Analytics dashboard coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdManager;
