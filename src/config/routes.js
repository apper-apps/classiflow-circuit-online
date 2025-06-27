import React from "react";
import ListingDetail from "@/components/pages/ListingDetail";
import EmbedManager from "@/components/pages/EmbedManager";
import MyListings from "@/components/pages/MyListings";
import TeamManager from "@/components/pages/TeamManager";
import AdminDashboard from "@/components/pages/AdminDashboard";
import Browse from "@/components/pages/Browse";
import BrandingManager from "@/components/pages/BrandingManager";
import Home from "@/components/pages/Home";
import PostAd from "@/components/pages/PostAd";
import CategoryManager from "@/components/pages/CategoryManager";
import EmbedViewer from "@/components/pages/EmbedViewer";
export const routes = {
  home: {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: 'Home',
    component: Home
  },
  browse: {
    id: 'browse',
    label: 'Browse Listings',
    path: '/browse',
    icon: 'Search',
    component: Browse
  },
  postAd: {
    id: 'postAd',
    label: 'Post Ad',
    path: '/post',
    icon: 'Plus',
    component: PostAd
  },
  myListings: {
    id: 'myListings',
    label: 'My Listings',
    path: '/my-listings',
    icon: 'FileText',
    component: MyListings
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: 'Settings',
    component: AdminDashboard
  },
categories: {
    id: 'categories',
    label: 'Categories',
    path: '/admin/categories',
    icon: 'FolderTree',
    component: CategoryManager
  },
  branding: {
    id: 'branding',
    label: 'Branding',
    path: '/admin/branding',
    icon: 'Palette',
    component: BrandingManager
  },
  teams: {
    id: 'teams',
    label: 'Team Management',
    path: '/admin/teams',
    icon: 'Users',
component: TeamManager
  },
  embeds: {
    id: 'embeds',
    label: 'Embed Manager',
    path: '/admin/embeds',
    icon: 'Monitor',
    component: EmbedManager
  },
  messages: {
    id: 'messages',
    label: 'Messages',
    path: '/admin/messages',
    icon: 'MessageCircle',
    component: React.lazy(() => import('@/components/pages/MessageCenter'))
  },
listingDetail: {
    id: 'listingDetail',
    label: 'Listing Detail',
    path: '/listing/:id',
    icon: 'Eye',
    component: ListingDetail
  },
  embedViewer: {
    id: 'embedViewer',
    label: 'Embed Viewer',
    path: '/embed/:embedId',
component: EmbedViewer,
    isPublic: true
  },
  paymentSuccess: {
    id: 'paymentSuccess',
    label: 'Payment Success',
    path: '/payment/success',
    icon: 'CheckCircle',
    component: React.lazy(() => import('@/components/pages/PaymentSuccess'))
  },
  paymentCancel: {
    id: 'paymentCancel',
    label: 'Payment Cancelled',
    path: '/payment/cancel',
    icon: 'XCircle',
    component: React.lazy(() => import('@/components/pages/PaymentCancel'))
  }
};

export const routeArray = Object.values(routes);
export default routes;