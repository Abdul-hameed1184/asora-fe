import { Button } from '@/components/ui/button'
import { Plus, Wallet, Wallet2, ChevronRight } from 'lucide-react'
import React from 'react'
import { Table, Column } from './components/Table'
import { Analytics } from './components/Analytics'
import { cn } from '@/lib/utils'

interface Order {
  id: string;
  reference: string;
  collection: string;
  date: {
    day: string;
    time: string;
  };
  status: 'In Transit' | 'Delivered';
  value: string;
}

const orders: Order[] = [
  {
    id: '1',
    reference: '#AS-91 381',
    collection: 'Heritage Silk Aso-Oke',
    date: { day: 'Oct 14,', time: '10:14' },
    status: 'In Transit',
    value: '₦450,000',
  },
  {
    id: '2',
    reference: '#AS-91 104',
    collection: 'Bespoke Agbada Suite',
    date: { day: 'Sep 11,', time: '10:14' },
    status: 'Delivered',
    value: '₦820,000',
  },
  {
    id: '3',
    reference: '#AS-88111',
    collection: 'Journal Edit: Linen Wrap',
    date: { day: 'Aug 05,', time: '10:14' },
    status: 'Delivered',
    value: '₦185,000',
  },
];

const page = () => {
  const columns: Column<Order>[] = [
    {
      header: 'ORDER REFERENCE',
      className: 'font-sans text-lg font-medium text-zinc-900 align-middle',
      render: (row) => row.reference,
    },
    {
      header: 'COLLECTION',
      className: 'font-sans text-lg text-zinc-800 align-middle',
      render: (row) => row.collection,
    },
    {
      header: 'DATE',
      className: 'align-middle',
      render: (row) => (
        <div className="flex flex-col text-sm text-zinc-500 font-sans">
          <span>{row.date.day}</span>
          <span>{row.date.time}</span>
        </div>
      ),
    },
    {
      header: 'STATUS',
      className: 'align-middle',
      render: (row) => {
        const isTransit = row.status === 'In Transit';
        return (
          <span
            className={cn(
              "inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider text-center",
              isTransit
                ? "bg-[#FAF4EB] text-[#A67C37]"
                : "bg-[#EAEAEA] text-[#737373]"
            )}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'VALUE',
      className: 'font-sans text-lg font-semibold text-zinc-900 align-middle',
      render: (row) => row.value,
    },
    {
      header: 'ACTION',
      headerClassName: 'text-right pr-8',
      className: 'text-right pr-8 align-middle',
      render: () => (
        <div className="flex justify-end">
          <ChevronRight size={20} className="text-zinc-400" />
        </div>
      ),
    },
  ];

  return (
    <div className='max-w-7xl pt-7 mx-auto px-6 md:px-10 pb-16'>
      <section className='flex justify-between items-center mx-auto py-5 '>
        <div className="flex flex-col gap-2">
          <h1 className='text-4xl text-foreground font-serif'>Hello, Adaeze</h1>
          <p className='text-zinc-500'>Welcome back to your curated space.</p>
        </div>

        <Button className='bg-primary text-tertiary hover:bg-primary/90 rounded-full px-6 py-5 text-md font-medium transition-all duration-300'>
          <Plus size={18} />
          Add New Product
        </Button>
      </section>

      <section className='grid md:grid-cols-3 grid-col-1 gap-6 mt-4'>
        <div className="border border-border p-8 flex flex-col gap-2 bg-white shadow-sm">
          <p className='mt-1 text-md tracking-[4px] uppercase text-[#D2C5B1] font-semibold font-courier'>TOTAL INVESTMENT</p>
          <p className='font-garamound text-3xl font-medium text-zinc-900 mt-1'>₦45,000</p>
          <div className="flex justify-between mt-5 pt-4 border-t border-zinc-100">
            <Wallet size={22} className='text-[#C99A36]' />
            <p className='text-zinc-500 text-sm'>14 items</p>
          </div>
        </div>

        <div className="border border-border p-8 flex flex-col gap-2 bg-white shadow-sm">
          <p className='mt-1 text-md tracking-[4px] uppercase text-[#D2C5B1] font-semibold font-courier'>PAID ORDER COUNT</p>
          <p className='font-garamound text-3xl font-medium text-zinc-900 mt-1'>16</p>
          <div className="flex justify-between mt-5 pt-4 border-t border-zinc-100">
            <Wallet2 size={22} className='text-[#C99A36]' />
            <p className='text-zinc-500 text-sm'>14 items</p>
          </div>
        </div>

        <div className="border border-border p-8 flex flex-col gap-2 bg-white shadow-sm">
          <p className='mt-1 text-md tracking-[4px] uppercase text-[#D2C5B1] font-semibold font-courier'>TOTAL PRODUCTS</p>
          <p className='font-garamound text-3xl font-medium text-zinc-900 mt-1'>16</p>
          <div className="flex justify-between mt-5 pt-4 border-t border-zinc-100">
            <Plus size={22} className='text-[#C99A36]' />
            <p className='text-zinc-500 text-sm'>14 items</p>
          </div>
        </div>
      </section>

      {/* Analytics Graph & Categories Section */}
      <Analytics />

      {/* Recent Orders Table Section */}
      <section className='mt-10'>
        <Table
          title="Recent Orders"
          actionLabel="View all"
          actionHref="/admin/orders"
          columns={columns}
          data={orders}
        />
      </section>
    </div>
  )
}

export default page