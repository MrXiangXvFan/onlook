import React, { Fragment } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  CreditCardIcon,
  FileIcon,
  HomeIcon,
  LineChartIcon,
  ListFilterIcon,
  MoveVerticalIcon,
  Package2Icon,
  PackageIcon,
  PanelLeftIcon,
  SearchIcon,
  ShoppingCartIcon,
  TruckIcon,
  UsersIcon,
} from "./shared"
import { Sidebar } from "./sidebar"
import Test from "./text"

const innerCom = () => {
  return <div>文件内的组件</div>
}
/**
 * next项目的主视图
 * 项目跑起来之后，可以改动的那个页面，就是这个文件了。
 * @returns
 */
export function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div>111</div>
      <h1 className="text-[#2c63e2]">222</h1>
      <Test></Test>
      {innerCom()};
    </div>
  )
}
