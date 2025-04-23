import { DefaultSeoProps } from 'next-seo';

const SEO: DefaultSeoProps = {
    title:"SkyVoyage | Term Project",
    description:"SkyVoyage is A CPE 241 Term Project, providing you with the best flight deals.",
    canonical:"https://skyvoyage.mwn99.com/",
    openGraph:{
        type: 'website',
        locale: 'en_US',
        title: 'SkyVoyage | Term Project',
        description: 'SkyVoyage is A CPE 241 Term Project, providing you with the best flight deals.',
        url: 'https://skyvoyage.mwn99.com/',
        siteName: 'skyvoyage',
        images:[
            {
                url: '/banner.jpg',
                width: 1890,
                height: 945,
                alt: 'SkyVoyage - CPE241 Term Project',
            },
        ]
    }
};

export default SEO;