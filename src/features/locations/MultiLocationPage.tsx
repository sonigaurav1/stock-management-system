'use client';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery } from 'convex/react';
import { Loader2, Plus, Star } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types returned by convex queries                                   */
/* ------------------------------------------------------------------ */

interface LocationMetric {
  locationId: string;
  name: string;
  code?: string;
  skuCount: number;
  totalUnits: number;
  inventoryValue: number;
}

interface SalesByLocation {
  locationId: string;
  name: string;
  revenue: number;
  orders: number;
}

interface DashboardMetrics {
  windowDays: number;
  locations: LocationMetric[];
  salesByLocation: SalesByLocation[];
  unassignedRevenue: number;
  company: {
    locationCount: number;
    totalSkuLocations: number;
    totalUnits: number;
    inventoryValue: number;
  };
}

interface SyncOverview {
  locations: Array<{ id: string; name: string; isDefault: boolean }>;
  productCount: number;
  trackedRows: number;
  mismatches: Array<{
    productId: string;
    name: string;
    ledger: number;
    sumLocations: number;
  }>;
}

interface MatrixLocation {
  id: string;
  name: string;
}

interface MatrixRow {
  productId: string;
  name: string;
  sku: string;
  cells: Record<string, number>;
  sumLocations: number;
  ledger: number;
}

interface InventoryMatrix {
  locations: MatrixLocation[];
  rows: MatrixRow[];
}

interface CompareLocation extends LocationMetric {
  rank: number;
}

interface LocationCompare {
  compare: CompareLocation[];
  salesCompare: SalesByLocation[];
}

/* ------------------------------------------------------------------ */

export default function MultiLocationPage() {
  const locations = useQuery(api.locations.listLocations) ?? [];
  const dashboard = useQuery(api.locations.getLocationDashboardMetrics, {
    days: 30
  }) as DashboardMetrics | undefined;
  const syncOverview = useQuery(api.locations.getInventorySyncOverview) as
    | SyncOverview
    | undefined;
  const matrix = useQuery(api.locations.getInventoryMatrix, { limit: 100 }) as
    | InventoryMatrix
    | undefined;
  const compare = useQuery(api.locations.compareLocations, { days: 30 }) as
    | LocationCompare
    | undefined;
  const transfers = useQuery(api.stockTransfers.listStockTransfers, {
    limit: 40
  });
  const products = useQuery(api.products.getAllProducts) ?? [];

  const ensureMigrate = useMutation(
    api.locations.ensureDefaultLocationAndMigrate
  );
  const createLoc = useMutation(api.locations.createLocation);
  const setDefault = useMutation(api.locations.setDefaultLocation);
  const setActive = useMutation(api.locations.setLocationActive);
  const transferStock = useMutation(api.stockTransfers.transferStock);

  const [reportLoc, setReportLoc] = React.useState<string>('');
  const localReport = useQuery(api.locations.getLocalSalesReport, {
    days: 30,
    ...(reportLoc ? { locationId: reportLoc as Id<'locations'> } : {})
  });

  const [locOpen, setLocOpen] = React.useState(false);
  const [locName, setLocName] = React.useState('');
  const [locCode, setLocCode] = React.useState('');

  const [tpProduct, setTpProduct] = React.useState('');
  const [tpFrom, setTpFrom] = React.useState('');
  const [tpTo, setTpTo] = React.useState('');
  const [tpQty, setTpQty] = React.useState('1');

  const activeLocs = locations.filter((l) => l.isActive);

  return (
    <Tabs defaultValue='dashboard' className='w-full space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <TabsList className='flex h-auto flex-wrap gap-1'>
          <TabsTrigger value='dashboard'>Location dashboard</TabsTrigger>
          <TabsTrigger value='sync'>Inventory sync</TabsTrigger>
          <TabsTrigger value='transfers'>Transfers</TabsTrigger>
          <TabsTrigger value='reports'>Local reporting</TabsTrigger>
          <TabsTrigger value='compare'>Compare</TabsTrigger>
        </TabsList>
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='secondary'
            onClick={async () => {
              try {
                const r = await ensureMigrate({});
                toast.success(
                  r.migrated > 0
                    ? `Ready — migrated ${r.migrated} SKUs to default site`
                    : 'Locations are up to date'
                );
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Failed');
              }
            }}
          >
            Initialize / migrate stock
          </Button>
          <Dialog open={locOpen} onOpenChange={setLocOpen}>
            <DialogTrigger asChild>
              <Button type='button'>
                <Plus className='mr-2 h-4 w-4' />
                Add location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New location</DialogTitle>
              </DialogHeader>
              <div className='space-y-3 py-2'>
                <div className='space-y-2'>
                  <Label>Name</Label>
                  <Input
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Code (optional)</Label>
                  <Input
                    value={locCode}
                    onChange={(e) => setLocCode(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    if (!locName.trim()) {
                      toast.error('Name is required');
                      return;
                    }
                    try {
                      await createLoc({
                        name: locName.trim(),
                        code: locCode.trim() || undefined,
                        setAsDefault: activeLocs.length === 0
                      });
                      toast.success('Location created');
                      setLocOpen(false);
                      setLocName('');
                      setLocCode('');
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Failed');
                    }
                  }}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base'>Sites</CardTitle>
          <CardDescription>
            Default site receives invoice stock deductions when sales include a
            location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className='text-muted-foreground'>
                    No locations yet — use Initialize or Add location.
                  </TableCell>
                </TableRow>
              )}
              {locations.map((l) => (
                <TableRow key={l._id}>
                  <TableCell className='font-medium'>
                    {l.name}
                    {l.isDefault && (
                      <Badge variant='secondary' className='ml-2'>
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{l.code ?? '—'}</TableCell>
                  <TableCell>{l.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className='space-x-2 text-right'>
                    {!l.isDefault && l.isActive && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={async () => {
                          try {
                            await setDefault({ locationId: l._id });
                            toast.success('Default site updated');
                          } catch (e) {
                            toast.error(
                              e instanceof Error ? e.message : 'Failed'
                            );
                          }
                        }}
                      >
                        <Star className='mr-1 h-3 w-3' />
                        Set default
                      </Button>
                    )}
                    {l.isActive && !l.isDefault && (
                      <Button
                        size='sm'
                        variant='ghost'
                        className='text-destructive'
                        onClick={async () => {
                          if (!confirm(`Deactivate "${l.name}"?`)) return;
                          try {
                            await setActive({
                              locationId: l._id,
                              isActive: false
                            });
                            toast.success('Location deactivated');
                          } catch (e) {
                            toast.error(
                              e instanceof Error ? e.message : 'Failed'
                            );
                          }
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TabsContent value='dashboard' className='space-y-4'>
        {!dashboard ? (
          <div className='flex justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <MetricCard
                title='Company units'
                value={String(dashboard.company.totalUnits)}
                hint='Sum across locations'
              />
              <MetricCard
                title='Inventory value'
                value={`$${dashboard.company.inventoryValue.toLocaleString()}`}
                hint='Cost basis where purchase price set'
              />
              <MetricCard
                title='Active sites'
                value={String(dashboard.company.locationCount)}
              />
              <MetricCard
                title='Unassigned sales (30d)'
                value={`$${dashboard.unassignedRevenue.toLocaleString()}`}
                hint='Invoices before location tagging'
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Per-location inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead className='text-right'>SKUs</TableHead>
                      <TableHead className='text-right'>Units</TableHead>
                      <TableHead className='text-right'>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.locations.map((m) => (
                      <TableRow key={m.locationId}>
                        <TableCell>{m.name}</TableCell>
                        <TableCell className='text-right'>
                          {m.skuCount}
                        </TableCell>
                        <TableCell className='text-right'>
                          {m.totalUnits}
                        </TableCell>
                        <TableCell className='text-right'>
                          ${m.inventoryValue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Sales by location (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead className='text-right'>Orders</TableHead>
                      <TableHead className='text-right'>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.salesByLocation.map((s) => (
                      <TableRow key={s.locationId}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className='text-right'>{s.orders}</TableCell>
                        <TableCell className='text-right'>
                          ${s.revenue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>

      <TabsContent value='sync' className='space-y-4'>
        {!syncOverview || !matrix ? (
          <Loader2 className='mx-auto h-8 w-8 animate-spin text-muted-foreground' />
        ) : (
          <>
            <div className='grid gap-4 md:grid-cols-3'>
              <MetricCard
                title='Products'
                value={String(syncOverview.productCount)}
              />
              <MetricCard
                title='Tracked rows'
                value={String(syncOverview.trackedRows)}
              />
              <MetricCard
                title='Sites'
                value={String(syncOverview.locations.length)}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Ledger vs locations</CardTitle>
                <CardDescription>
                  Rows where sum of site quantities differs from product ledger
                  (top 50).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {syncOverview.mismatches.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    No mismatches detected.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className='text-right'>Ledger</TableHead>
                        <TableHead className='text-right'>Sites sum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncOverview.mismatches.map((m) => (
                        <TableRow key={m.productId}>
                          <TableCell>{m.name}</TableCell>
                          <TableCell className='text-right'>
                            {m.ledger}
                          </TableCell>
                          <TableCell className='text-right'>
                            {m.sumLocations}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Inventory matrix</CardTitle>
                <CardDescription>
                  Quantities per site (subset of products)
                </CardDescription>
              </CardHeader>
              <CardContent className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      {matrix.locations.map((l) => (
                        <TableHead
                          key={l.id}
                          className='whitespace-nowrap text-right'
                        >
                          {l.name}
                        </TableHead>
                      ))}
                      <TableHead className='text-right'>Σ sites</TableHead>
                      <TableHead className='text-right'>Ledger</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matrix.rows.map((r) => (
                      <TableRow key={r.productId}>
                        <TableCell className='font-mono text-xs'>
                          {r.sku}
                        </TableCell>
                        <TableCell>{r.name}</TableCell>
                        {matrix.locations.map((l) => (
                          <TableCell key={l.id} className='text-right'>
                            {r.cells[l.id] ?? 0}
                          </TableCell>
                        ))}
                        <TableCell className='text-right'>
                          {r.sumLocations}
                        </TableCell>
                        <TableCell className='text-right'>{r.ledger}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>

      <TabsContent value='transfers' className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              Move stock between sites
            </CardTitle>
            <CardDescription>
              Transfers update site rows and keep the product ledger aligned
              with totals.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
            <div className='space-y-2 lg:col-span-2'>
              <Label>Product</Label>
              <Select value={tpProduct} onValueChange={setTpProduct}>
                <SelectTrigger>
                  <SelectValue placeholder='Select product' />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>From</Label>
              <Select value={tpFrom} onValueChange={setTpFrom}>
                <SelectTrigger>
                  <SelectValue placeholder='Source' />
                </SelectTrigger>
                <SelectContent>
                  {activeLocs.map((l) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>To</Label>
              <Select value={tpTo} onValueChange={setTpTo}>
                <SelectTrigger>
                  <SelectValue placeholder='Destination' />
                </SelectTrigger>
                <SelectContent>
                  {activeLocs.map((l) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Quantity</Label>
              <Input
                type='number'
                min={1}
                value={tpQty}
                onChange={(e) => setTpQty(e.target.value)}
              />
            </div>
            <div className='flex items-end md:col-span-2 lg:col-span-5'>
              <Button
                onClick={async () => {
                  const q = Number(tpQty);
                  if (!tpProduct || !tpFrom || !tpTo || q < 1) {
                    toast.error('Select product, sites, and quantity');
                    return;
                  }
                  try {
                    await transferStock({
                      productId: tpProduct as Id<'products'>,
                      fromLocationId: tpFrom as Id<'locations'>,
                      toLocationId: tpTo as Id<'locations'>,
                      quantity: q
                    });
                    toast.success('Transfer completed');
                    setTpQty('1');
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Failed');
                  }
                }}
              >
                Execute transfer
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Recent transfers</CardTitle>
          </CardHeader>
          <CardContent>
            {!transfers ? (
              <Loader2 className='h-6 w-6 animate-spin' />
            ) : transfers.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No transfers yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className='text-right'>Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell className='text-xs text-muted-foreground'>
                        {new Date(t.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {t.productName}
                        <span className='block text-xs text-muted-foreground'>
                          Site movement recorded
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>{t.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='reports' className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Sales report</CardTitle>
            <CardDescription>
              Consolidated (all sites) or filtered to one location when tagged
              on sales.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap items-end gap-4'>
            <div className='space-y-2'>
              <Label>Scope</Label>
              <Select
                value={reportLoc || '__all'}
                onValueChange={(v) => setReportLoc(v === '__all' ? '' : v)}
              >
                <SelectTrigger className='w-[220px]'>
                  <SelectValue placeholder='All locations' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='__all'>
                    All locations (consolidated)
                  </SelectItem>
                  {activeLocs.map((l) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!localReport ? (
              <Loader2 className='h-6 w-6 animate-spin' />
            ) : (
              <div className='flex flex-wrap gap-6 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Mode</p>
                  <p className='font-medium'>{localReport.mode}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Orders</p>
                  <p className='font-medium'>{localReport.orders}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Revenue</p>
                  <p className='font-medium'>
                    ${localReport.revenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Units sold</p>
                  <p className='font-medium'>{localReport.units}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='compare' className='space-y-4'>
        {!compare ? (
          <Loader2 className='mx-auto h-8 w-8 animate-spin text-muted-foreground' />
        ) : (
          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>By inventory value</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className='text-right'>Value</TableHead>
                      <TableHead className='text-right'>Units</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compare.compare.map((c) => (
                      <TableRow key={c.locationId}>
                        <TableCell>{c.rank}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell className='text-right'>
                          ${c.inventoryValue.toLocaleString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          {c.totalUnits}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  By sales revenue (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead className='text-right'>Revenue</TableHead>
                      <TableHead className='text-right'>Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compare.salesCompare.map((s) => (
                      <TableRow key={s.locationId}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className='text-right'>
                          ${s.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className='text-right'>{s.orders}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function MetricCard({
  title,
  value,
  hint
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardDescription>{title}</CardDescription>
        <CardTitle className='text-2xl'>{value}</CardTitle>
        {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
      </CardHeader>
    </Card>
  );
}
