import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Palette, Users, MessageSquare, Zap, Plus, Trash2, Edit } from "lucide-react";
import { Link } from "wouter";

interface CustomPersonality {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
}

interface Settings {
  theme: string;
  primaryColor: string;
  tone: string;
  customPersonalities: CustomPersonality[];
  quickShortcuts: Array<{ id: string; title: string; text: string }>;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    primaryColor: 'green',
    tone: 'friendly',
    customPersonalities: [],
    quickShortcuts: []
  });

  const [newPersonality, setNewPersonality] = useState({
    name: '',
    description: '',
    prompt: '',
    icon: '🤖'
  });

  const [newShortcut, setNewShortcut] = useState({
    title: '',
    text: ''
  });

  const [editingPersonality, setEditingPersonality] = useState<string | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('chatSettings', JSON.stringify(newSettings));
    
    // Apply theme changes immediately
    document.documentElement.className = newSettings.theme;
    document.documentElement.style.setProperty('--primary-hue', getColorHue(newSettings.primaryColor));
  };

  const getColorHue = (color: string) => {
    const hues = {
      green: '142',
      blue: '210',
      purple: '270',
      red: '0',
      orange: '30',
      pink: '320'
    };
    return hues[color as keyof typeof hues] || '142';
  };

  const addCustomPersonality = () => {
    if (!newPersonality.name || !newPersonality.prompt) return;
    
    const personality: CustomPersonality = {
      id: Date.now().toString(),
      name: newPersonality.name,
      description: newPersonality.description,
      prompt: newPersonality.prompt,
      icon: newPersonality.icon
    };

    const updatedSettings = {
      ...settings,
      customPersonalities: [...settings.customPersonalities, personality]
    };
    
    saveSettings(updatedSettings);
    setNewPersonality({ name: '', description: '', prompt: '', icon: '🤖' });
  };

  const removeCustomPersonality = (id: string) => {
    const updatedSettings = {
      ...settings,
      customPersonalities: settings.customPersonalities.filter(p => p.id !== id)
    };
    saveSettings(updatedSettings);
  };

  const addQuickShortcut = () => {
    if (!newShortcut.title || !newShortcut.text) return;
    
    const shortcut = {
      id: Date.now().toString(),
      title: newShortcut.title,
      text: newShortcut.text
    };

    const updatedSettings = {
      ...settings,
      quickShortcuts: [...settings.quickShortcuts, shortcut]
    };
    
    saveSettings(updatedSettings);
    setNewShortcut({ title: '', text: '' });
  };

  const removeQuickShortcut = (id: string) => {
    const updatedSettings = {
      ...settings,
      quickShortcuts: settings.quickShortcuts.filter(s => s.id !== id)
    };
    saveSettings(updatedSettings);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">إعدادات التخصيص</h1>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              الثيم والألوان
            </TabsTrigger>
            <TabsTrigger value="personalities" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              الشخصيات
            </TabsTrigger>
            <TabsTrigger value="tone" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              نبرة الردود
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              الاختصارات
            </TabsTrigger>
          </TabsList>

          {/* Theme Settings */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المظهر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>الثيم العام</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => saveSettings({ ...settings, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">فاتح</SelectItem>
                      <SelectItem value="dark">داكن</SelectItem>
                      <SelectItem value="auto">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>اللون الأساسي</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['green', 'blue', 'purple', 'red', 'orange', 'pink'].map(color => (
                      <Button
                        key={color}
                        variant={settings.primaryColor === color ? "default" : "outline"}
                        className={`h-12 ${color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                          color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                          color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
                          color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                          color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
                          'bg-pink-500 hover:bg-pink-600'
                        }`}
                        onClick={() => saveSettings({ ...settings, primaryColor: color })}
                        data-testid={`color-${color}`}
                      >
                        {color === 'green' && '🟢'}
                        {color === 'blue' && '🔵'}
                        {color === 'purple' && '🟣'}
                        {color === 'red' && '🔴'}
                        {color === 'orange' && '🟠'}
                        {color === 'pink' && '🩷'}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Personalities */}
          <TabsContent value="personalities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إنشاء شخصية مخصصة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اسم الشخصية</Label>
                    <Input
                      value={newPersonality.name}
                      onChange={(e) => setNewPersonality({ ...newPersonality, name: e.target.value })}
                      placeholder="مثال: مطور ألعاب"
                      data-testid="input-personality-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الأيقونة</Label>
                    <Input
                      value={newPersonality.icon}
                      onChange={(e) => setNewPersonality({ ...newPersonality, icon: e.target.value })}
                      placeholder="🎮"
                      className="text-center"
                      data-testid="input-personality-icon"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Input
                    value={newPersonality.description}
                    onChange={(e) => setNewPersonality({ ...newPersonality, description: e.target.value })}
                    placeholder="خبير في تطوير الألعاب والبرمجة التفاعلية"
                    data-testid="input-personality-description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>التعليمات المخصصة</Label>
                  <Textarea
                    value={newPersonality.prompt}
                    onChange={(e) => setNewPersonality({ ...newPersonality, prompt: e.target.value })}
                    placeholder="أنت خبير في تطوير الألعاب، تساعد في Unity وUnreal Engine وتصميم اللعب..."
                    rows={4}
                    data-testid="textarea-personality-prompt"
                  />
                </div>
                
                <Button onClick={addCustomPersonality} className="w-full" data-testid="button-add-personality">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة الشخصية
                </Button>
              </CardContent>
            </Card>

            {/* Existing Custom Personalities */}
            {settings.customPersonalities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>الشخصيات المخصصة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {settings.customPersonalities.map(personality => (
                      <div key={personality.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{personality.icon}</span>
                          <div>
                            <h3 className="font-medium">{personality.name}</h3>
                            <p className="text-sm text-slate-600">{personality.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setEditingPersonality(personality.id)}
                            data-testid={`button-edit-${personality.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeCustomPersonality(personality.id)}
                            data-testid={`button-delete-${personality.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tone Settings */}
          <TabsContent value="tone" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>نبرة الردود</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>اختر نبرة الردود المفضلة</Label>
                  <Select
                    value={settings.tone}
                    onValueChange={(value) => saveSettings({ ...settings, tone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">ودود ومرح</SelectItem>
                      <SelectItem value="professional">مهني ورسمي</SelectItem>
                      <SelectItem value="casual">عادي ومريح</SelectItem>
                      <SelectItem value="detailed">مفصل وعلمي</SelectItem>
                      <SelectItem value="concise">مختصر ومباشر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 bg-slate-100 rounded-lg">
                  <h4 className="font-medium mb-2">مثال على النبرة المختارة:</h4>
                  <p className="text-sm text-slate-700">
                    {settings.tone === 'friendly' && "مرحباً صديقي! سعيد جداً بمساعدتك 😊 إيه اللي محتاجه النهارده؟"}
                    {settings.tone === 'professional' && "أهلاً وسهلاً، كيف يمكنني مساعدتكم اليوم؟ أنا هنا لتقديم أفضل خدمة ممكنة."}
                    {settings.tone === 'casual' && "أهلاً! إيه اللي عاوز مساعدة فيه؟ قول كده وهشوف أقدر أساعدك إزاي."}
                    {settings.tone === 'detailed' && "مرحباً بك، أنا مساعد ذكي متخصص في تقديم إجابات شاملة ومفصلة بناءً على أحدث المعلومات المتاحة."}
                    {settings.tone === 'concise' && "مرحباً. كيف يمكنني المساعدة؟"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Shortcuts */}
          <TabsContent value="shortcuts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إضافة اختصار سريع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>عنوان الاختصار</Label>
                    <Input
                      value={newShortcut.title}
                      onChange={(e) => setNewShortcut({ ...newShortcut, title: e.target.value })}
                      placeholder="اكتب كود HTML"
                      data-testid="input-shortcut-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>النص المرسل</Label>
                    <Input
                      value={newShortcut.text}
                      onChange={(e) => setNewShortcut({ ...newShortcut, text: e.target.value })}
                      placeholder="اكتبلي كود HTML لصفحة ويب بسيطة"
                      data-testid="input-shortcut-text"
                    />
                  </div>
                </div>
                
                <Button onClick={addQuickShortcut} className="w-full" data-testid="button-add-shortcut">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة الاختصار
                </Button>
              </CardContent>
            </Card>

            {/* Existing Shortcuts */}
            {settings.quickShortcuts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>الاختصارات السريعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {settings.quickShortcuts.map(shortcut => (
                      <div key={shortcut.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{shortcut.title}</h3>
                          <p className="text-sm text-slate-600">{shortcut.text}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeQuickShortcut(shortcut.id)}
                          data-testid={`button-delete-shortcut-${shortcut.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}