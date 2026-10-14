import {mockups} from '../data/mockups';
export const getMockups=async()=>mockups;
export const getMockupBySlug=async slug=>mockups.find(x=>x.slug===slug);
