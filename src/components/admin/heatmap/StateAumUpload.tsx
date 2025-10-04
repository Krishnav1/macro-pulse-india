import { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ParsedCompositionData {
  monthYear: string;
  states: Array<{
    stateName: string;
    industryShare: number;
    liquidMoneyMarket: number | null;
    debtOriented: number | null;
    equityOriented: number | null;
    etfsFofs: number | null;
  }>;
}

interface ParsedCategoryData {
  monthYear: string;
  entries: Array<{
    category: string;
    stateName: string;
    aumCrores: number;
    rank: number | null;
  }>;
}

export function StateAumUpload() {
  const [compositionFile, setCompositionFile] = useState<File | null>(null);
  const [categoryFile, setCategoryFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedComposition, setParsedComposition] = useState<ParsedCompositionData | null>(null);
  const [parsedCategory, setParsedCategory] = useState<ParsedCategoryData | null>(null);
  const { toast } = useToast();

  const parseCompositionCSV = async (file: File): Promise<ParsedCompositionData> => {
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    // First line should be "Month Year: YYYY-MM-DD"
    const dateMatch = lines[0].match(/Month Year:\s*(\d{4}-\d{2}-\d{2})/i);
    if (!dateMatch) {
      throw new Error('First line must be "Month Year: YYYY-MM-DD"');
    }
    const monthYear = dateMatch[1];

    // Second line should be headers
    const headers = lines[1].split(',').map(h => h.trim());
    if (headers.length < 2) {
      throw new Error('Invalid header format');
    }

    // Parse data rows
    const states = [];
    for (let i = 2; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 2) continue;

      const stateName = values[0];
      const industryShare = parseFloat(values[1]);
      const liquidMoneyMarket = values[2] ? parseFloat(values[2]) : null;
      const debtOriented = values[3] ? parseFloat(values[3]) : null;
      const equityOriented = values[4] ? parseFloat(values[4]) : null;
      const etfsFofs = values[5] ? parseFloat(values[5]) : null;

      if (isNaN(industryShare)) {
        throw new Error(`Invalid industry share for state ${stateName}: ${values[1]}`);
      }

      states.push({
        stateName,
        industryShare,
        liquidMoneyMarket,
        debtOriented,
        equityOriented,
        etfsFofs,
      });
    }

    if (states.length === 0) {
      throw new Error('No valid state data found in file');
    }

    return { monthYear, states };
  };

  const parseCategoryCSV = async (file: File): Promise<ParsedCategoryData> => {
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    // First line should be "Month Year: YYYY-MM-DD"
    const dateMatch = lines[0].match(/Month Year:\s*(\d{4}-\d{2}-\d{2})/i);
    if (!dateMatch) {
      throw new Error('First line must be "Month Year: YYYY-MM-DD"');
    }
    const monthYear = dateMatch[1];

    // Parse data rows
    const entries = [];
    for (let i = 2; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 3) continue;

      const category = values[0];
      const stateName = values[1];
      const aumCrores = parseFloat(values[2]);
      const rank = values[3] ? parseInt(values[3]) : null;

      if (isNaN(aumCrores)) {
        throw new Error(`Invalid AUM value for ${stateName} in ${category}: ${values[2]}`);
      }

      entries.push({
        category,
        stateName,
        aumCrores,
        rank,
      });
    }

    if (entries.length === 0) {
      throw new Error('No valid category data found in file');
    }

    return { monthYear, entries };
  };

  const handleCompositionFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setCompositionFile(selectedFile);
    setParsedComposition(null);

    try {
      const data = await parseCompositionCSV(selectedFile);
      setParsedComposition(data);
      toast({
        title: 'File parsed successfully',
        description: `Found ${data.states.length} states for ${data.monthYear}`,
      });
    } catch (error) {
      toast({
        title: 'Parse error',
        description: error instanceof Error ? error.message : 'Failed to parse file',
        variant: 'destructive',
      });
      setCompositionFile(null);
    }
  };

  const handleCategoryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setCategoryFile(selectedFile);
    setParsedCategory(null);

    try {
      const data = await parseCategoryCSV(selectedFile);
      setParsedCategory(data);
      toast({
        title: 'File parsed successfully',
        description: `Found ${data.entries.length} entries for ${data.monthYear}`,
      });
    } catch (error) {
      toast({
        title: 'Parse error',
        description: error instanceof Error ? error.message : 'Failed to parse file',
        variant: 'destructive',
      });
      setCategoryFile(null);
    }
  };

  const handleCompositionUpload = async () => {
    if (!parsedComposition) return;

    setUploading(true);

    try {
      // Check if data exists for this month
      const { data: existingData } = await supabase
        .from('state_aum_allocation' as any)
        .select('id')
        .eq('month_year', parsedComposition.monthYear)
        .limit(1);

      // Delete existing data for this month
      if (existingData && existingData.length > 0) {
        const { error: deleteError } = await supabase
          .from('state_aum_allocation' as any)
          .delete()
          .eq('month_year', parsedComposition.monthYear);

        if (deleteError) throw deleteError;

        toast({
          title: 'Existing data replaced',
          description: `Deleted existing data for ${parsedComposition.monthYear}`,
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Insert new data
      const records = parsedComposition.states.map(state => ({
        month_year: parsedComposition.monthYear,
        state_name: state.stateName,
        industry_share_percentage: state.industryShare,
        liquid_money_market_percentage: state.liquidMoneyMarket,
        debt_oriented_percentage: state.debtOriented,
        equity_oriented_percentage: state.equityOriented,
        etfs_fofs_percentage: state.etfsFofs,
      }));

      const { error: insertError } = await supabase
        .from('state_aum_allocation' as any)
        .insert(records);

      if (insertError) throw insertError;

      // Log upload
      await supabase.from('state_aum_uploads' as any).insert({
        month_year: parsedComposition.monthYear,
        total_states: parsedComposition.states.length,
        upload_type: 'composition',
      });

      toast({
        title: 'Upload successful',
        description: `Uploaded ${parsedComposition.states.length} states for ${parsedComposition.monthYear}`,
      });

      // Reset
      setCompositionFile(null);
      setParsedComposition(null);
      const fileInput = document.getElementById('composition-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload data',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryUpload = async () => {
    if (!parsedCategory) return;

    setUploading(true);

    try {
      // Check if data exists for this month
      const { data: existingData } = await supabase
        .from('state_aum_category_values' as any)
        .select('id')
        .eq('month_year', parsedCategory.monthYear)
        .limit(1);

      // Delete existing data for this month
      if (existingData && existingData.length > 0) {
        const { error: deleteError } = await supabase
          .from('state_aum_category_values' as any)
          .delete()
          .eq('month_year', parsedCategory.monthYear);

        if (deleteError) throw deleteError;

        toast({
          title: 'Existing data replaced',
          description: `Deleted existing data for ${parsedCategory.monthYear}`,
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Insert new data
      const records = parsedCategory.entries.map(entry => ({
        month_year: parsedCategory.monthYear,
        state_name: entry.stateName,
        category: entry.category,
        aum_crores: entry.aumCrores,
        rank: entry.rank,
      }));

      const { error: insertError } = await supabase
        .from('state_aum_category_values' as any)
        .insert(records);

      if (insertError) throw insertError;

      // Log upload
      await supabase.from('state_aum_uploads' as any).insert({
        month_year: parsedCategory.monthYear,
        total_states: parsedCategory.entries.length,
        upload_type: 'category',
      });

      toast({
        title: 'Upload successful',
        description: `Uploaded ${parsedCategory.entries.length} entries for ${parsedCategory.monthYear}`,
      });

      // Reset
      setCategoryFile(null);
      setParsedCategory(null);
      const fileInput = document.getElementById('category-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload data',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>State-wise AUM Data Upload</CardTitle>
        <CardDescription>
          Upload monthly state-wise AUM composition and category data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="composition" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="composition">AUM Composition</TabsTrigger>
            <TabsTrigger value="category">Category Rankings</TabsTrigger>
          </TabsList>

          {/* Composition Upload */}
          <TabsContent value="composition" className="space-y-4">
            {/* Template Download */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">Download Composition Template</h3>
                <p className="text-sm text-muted-foreground">
                  State-wise AUM percentage breakdown by category
                </p>
              </div>
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/templates/state_aum_composition_template.csv';
                  link.download = 'state_aum_composition_template.csv';
                  link.click();
                }}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label htmlFor="composition-file" className="text-sm font-medium">
                Upload CSV File
              </label>
              <input
                id="composition-file"
                type="file"
                accept=".csv"
                onChange={handleCompositionFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            {/* Preview */}
            {parsedComposition && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Month/Year:</strong> {parsedComposition.monthYear}
                    </div>
                    <div>
                      <strong>Total States:</strong> {parsedComposition.states.length}
                    </div>
                    <div className="mt-2">
                      <strong>Preview (first 5 states):</strong>
                      <ul className="mt-1 text-sm space-y-1">
                        {parsedComposition.states.slice(0, 5).map((state, idx) => (
                          <li key={idx}>
                            {state.stateName}: {state.industryShare}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleCompositionUpload}
              disabled={!parsedComposition || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Composition Data
                </>
              )}
            </Button>
          </TabsContent>

          {/* Category Upload */}
          <TabsContent value="category" className="space-y-4">
            {/* Template Download */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">Download Category Template</h3>
                <p className="text-sm text-muted-foreground">
                  Top states in each scheme category with AUM values
                </p>
              </div>
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/templates/state_aum_category_template.csv';
                  link.download = 'state_aum_category_template.csv';
                  link.click();
                }}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label htmlFor="category-file" className="text-sm font-medium">
                Upload CSV File
              </label>
              <input
                id="category-file"
                type="file"
                accept=".csv"
                onChange={handleCategoryFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            {/* Preview */}
            {parsedCategory && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Month/Year:</strong> {parsedCategory.monthYear}
                    </div>
                    <div>
                      <strong>Total Entries:</strong> {parsedCategory.entries.length}
                    </div>
                    <div className="mt-2">
                      <strong>Preview (first 5 entries):</strong>
                      <ul className="mt-1 text-sm space-y-1">
                        {parsedCategory.entries.slice(0, 5).map((entry, idx) => (
                          <li key={idx}>
                            {entry.category} - {entry.stateName}: ₹{entry.aumCrores} Cr
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleCategoryUpload}
              disabled={!parsedCategory || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Category Data
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>File Format:</strong>
            <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
              <li>First row: "Month Year: YYYY-MM-DD"</li>
              <li>Second row: Column headers</li>
              <li>Data rows: State data with percentages or values</li>
              <li>Uploading data for an existing month will replace it</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
