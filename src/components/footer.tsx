"use client"
import { LucidePlane } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
export const AppFooter = () => {
    return (
        <div className="bg-accent-foreground text-white pt-10 pb-6">
            <div className="container mx-auto px-6">
                {/* Top Section */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 text-sm text-gray-300">
                    {/* Logo */}
                    <div className="justify-center col-span-2 lg:col-span-1 flex items-center gap-10 lg:flex-col lg:items-start">
                        <LucidePlane className="w-20 h-20" />
                        <div className="text-4xl font-bold font-pacifico">SkyVoyage</div>
                    </div>

                
                    {/* About us */}
                    <div>
                        <h4 className="text-primary font-semibold mb-3">About us</h4>
                        <p>Created by</p>
                        <p>Group <span className='font-bold'>sudo apt i-love-ubuntu</span></p>
                        <p className='line-through'>&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;</p>
                        <p className="mt-2">Member</p>
                        <p>1002, 1011, 1018, 1020, 1029</p>
                        <p className='line-through'>&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;</p>
                    </div>

                    {/* Partnership */}
                    <div>
                        <h4 className="text-primary font-semibold mb-3">Partnership</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-blue-100">Business Solutions</Link></li>
                            <li><Link href="/" className="hover:text-blue-100">Travel Agencies</Link></li>
                            <li><Link href="/" className="hover:text-blue-100">Affiliate & Webmasters</Link></li>
                            <li><Link href="/" className="hover:text-blue-100">Drive with Us</Link></li>
                            <li><Link href="/" className="hover:text-blue-100">Become A Partner</Link></li>
                            <li><Link href="/" className="hover:text-blue-100">Register as Guide</Link></li>
                        </ul>
                    </div>

                    {/* Legal + Help */}
                    <div>
                        <h4 className="text-primary font-semibold mb-3">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-blue-100">Privacy Policy</Link></li>
                            <li><Link href="/" className="hover:text-blue-100">Terms & Conditions</Link></li>
                            <li><Link href="/" className="hover:text-blue-100">Cookie Policy</Link></li>
                        </ul>
                        <h4 className="text-primary font-semibold mt-4 mb-2">Help</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-blue-100">Help Center</Link></li>
                            <li><Link href="/" className="hover:text-blue-100">Get Support</Link></li>
                            <li><Link href="/admin" className="text-white font-semibold hover:text-blue-100">Admin Panel</Link></li>
                        </ul>
                    </div>
                    <div className="border-t-[1px] border-white pt-8 col-span-2 md:col-span-3 lg:col-span-4 flex flex-col items-center">
                        <h2 className="text-white font-semibold mb-4 text-lg">Subscribe to Our Newsletter</h2>
                        <p className="mb-4 text-gray-400">
                            Get the latest deals, travel tips, and updates delivered straight to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                            <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Button className="bg-primary cursor-pointer hover:bg-blue-700">Subscribe</Button>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white mt-8 pt-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} SkyVoyage, All rights reserved.</p>

                    {/* Social Icons */}

                    {/* Payment Icons */}
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <Image className="w-10 h-7" width={100} height={70} src="https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/logo/paypal.svg" alt="Paypal" />
                        <Image className="w-10 h-7" width={100} height={70} src="https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/logo/amex.svg" alt="Amex" />
                        <Image className="w-10 h-7" width={100} height={70} src="https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/logo/mastercard.svg" alt="MasterCard" />
                        <Image className="w-10 h-7" width={100} height={70} src="https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/logo/visa.svg" alt="Visa" />
                    </div>
                </div>
            </div>
        </div>
    );

}