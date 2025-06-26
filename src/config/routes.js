import Home from '@/components/pages/Home';
import Browse from '@/components/pages/Browse';
import PostAd from '@/components/pages/PostAd';
import MyListings from '@/components/pages/MyListings';
import AdminDashboard from '@/components/pages/AdminDashboard';
import CategoryManager from '@/components/pages/CategoryManager';
import ListingDetail from '@/components/pages/ListingDetail';

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
  listingDetail: {
    id: 'listingDetail',
    label: 'Listing Detail',
    path: '/listing/:id',
    icon: 'Eye',
    component: ListingDetail
  }
};

export const routeArray = Object.values(routes);
export default routes;