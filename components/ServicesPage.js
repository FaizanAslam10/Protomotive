import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from './Layout';

export default function ServicesPage() {
  const router = useRouter();

  // State for API data
  const [serviceContent, setServiceContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch services from API on mount
  useEffect(() => {
    fetchServicesFromAPI();
  }, []);

  const fetchServicesFromAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services/get-all?activeOnly=true');

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();

      if (data.success) {
        // Transform API data to match existing structure
        const transformedData = transformServicesData(data.services);
        setServiceContent(transformedData);
      } else {
        throw new Error(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message);
      // Fallback to hardcoded data if API fails
      setServiceContent(getHardcodedServiceContent());
    } finally {
      setLoading(false);
    }
  };

  // Transform API services into the format expected by the component
  const transformServicesData = (apiServices) => {
    const grouped = {};

    apiServices.forEach(service => {
      if (!grouped[service.category]) {
        grouped[service.category] = {
          count: 0,
          services: [],
          gridClass: 'col-12 col-md-6 col-lg-4'
        };
      }

      grouped[service.category].services.push({
        title: service.title,
        description: service.description,
        fullDescription: service.full_description,
        price: service.price,
        duration: service.duration,
        additional_pricing: service.additional_pricing || '',
        // Pass JSONB fields to be used by getServiceFeatures
        whats_included: service.whats_included || [],
        exterior_points: service.exterior_points || [],
        interior_points: service.interior_points || [],
        specifications: service.specifications || [],
        film_features: service.film_features || []
      });

      grouped[service.category].count++;
    });

    return grouped;
  };

  // Fallback hardcoded data (keep existing structure as backup)
  const getHardcodedServiceContent = () => ({
    'detailing': {
      count: 6,
      services: [
        { 
          title: 'PRECISION PACKAGE', 
          description: 'Over time, dirt and contaminants build up on your vehicles paintwork, glass, and chrome surfaces.', 
          fullDescription: 'Over time, dirt and contaminants build up on your vehicles paintwork, glass, and chrome surfaces. This dirt can NOT be removed by washing alone, and it prevents wax from effectively bonding on your paintwork, significantly reducing the shine of your vehicle. The solution is a Clay bar massage that smoothens your paint by removing the built-up dirt, leaving your paintwork smooth and glossy and ready for wax.',
          price: 'From $399.99', 
          duration: '2-4 Hours' 
        },
        { 
          title: 'GOLD PACKAGE', 
          description: 'Over time, dirt and contaminants build up on your vehicles paintwork, glass, and chrome surfaces.', 
          fullDescription: 'The GOLD PACKAGE delivers comprehensive interior and exterior detailing services for complete vehicle care. This mid-tier package includes a thorough exterior wash with full foam treatment, detailed rim cleaning, and professional tire dressing to enhance your vehicles appearance. Inside, we provide deep steam cleaning of carpets, seats, and vents, comprehensive vacuuming, and protective matte cleaner application on all interior surfaces. The service includes salt removal treatment, mat cleaning, door jamb detailing, and crystal-clear glass cleaning throughout. Perfect for regular maintenance, this package ensures your vehicle looks and feels refreshed while maintaining its value and extending the life of interior and exterior surfaces.',
          price: 'From $149.99', 
          duration: '2-4 Hours' 
        },
        { 
          title: 'BRONZE PACKAGE', 
          description: 'Over time, dirt and contaminants build up on your vehicles paintwork, glass, and chrome surfaces.', 
          fullDescription: 'The BRONZE PACKAGE is perfect for regular maintenance and basic protection of your vehicle. This service includes thorough exterior washing, basic paint decontamination, application of protective sealant, and interior cleaning with vacuuming and surface wiping. Wheels are cleaned and dressed, tires are treated with protection, and all glass surfaces are streak-free cleaned. While more basic than our premium packages, the Bronze Package still delivers professional results with quality products and attention to detail. Ideal for newer vehicles or those maintained regularly.',
          price: 'From $109.99', 
          duration: '1.5-3 Hours' 
        },
        { 
          title: 'ODOR REMOVAL', 
          description: 'Deodorization and decontamination package eliminates all odors from your vehicle.', 
          fullDescription: 'The ODOR REMOVAL service combines our complete Gold Package detailing with specialized odor elimination treatment for vehicles affected by smoke, pet odors, spills, or other persistent smells. This comprehensive service includes everything from our Gold Package - full exterior foam wash, rim detailing, tire dressing, interior steam cleaning of carpets and seats, vacuuming, matte cleaner protection, glass cleaning, and door jamb cleaning. Additionally, we provide a dedicated 2-hour odor eliminator treatment using professional-grade deodorization techniques and equipment to neutralize odors at their source. Our specialized process targets embedded odors in upholstery, carpeting, and air circulation systems, leaving your vehicle completely refreshed and odor-free. Perfect for used vehicles, rental returns, or any vehicle requiring both thorough cleaning and odor elimination.',
          price: 'From $279.99', 
          duration: '30 min-1 Hours' 
        },
        { 
          title: 'WASH ME', 
          description: 'Complete car wash.', 
          fullDescription: 'The WASH ME service is our quick and convenient solution for busy vehicle owners who need a reliable, professional car wash. Using the proven two-bucket wash method, we ensure your vehicle receives a thorough and safe cleaning that minimizes the risk of scratches and swirl marks. This technique involves separate buckets for soapy water and clean rinse water, allowing us to keep dirt and debris away from your vehicles paint surface. Our trained technicians hand-wash your entire vehicle using premium car soap and microfiber mitts, paying attention to all exterior surfaces including the body, wheels, and glass. The service includes a complete rinse and spot-free drying to leave your vehicle looking clean and refreshed. Perfect for regular maintenance between full detailing services, or when you simply need a quality wash at an affordable price. Quick 30-minute service gets you back on the road with a sparkling clean vehicle.',
          price: 'From $30', 
          duration: '30 Minutes' 
        },
        { 
          title: 'LEATHER TREATMENT', 
          description: 'leather conditioning', 
          fullDescription: 'The LEATHER TREATMENT service is a specialized conditioning and protection program designed to restore, nourish, and extend the life of your vehicles leather surfaces. Our comprehensive treatment begins with thorough cleaning of all leather seats, door panels, dashboard, and trim using pH-balanced leather cleaners that safely remove dirt, oils, and buildup without damaging the natural grain. Following cleaning, we apply premium leather conditioners that penetrate deep into the material to restore suppleness and prevent cracking, fading, and premature aging. The enhanced durability treatment includes UV protection to shield against sun damage and a protective barrier that repels spills and stains. Our process maintains the leathers natural texture and appearance while significantly extending its lifespan. This service is essential for preserving the luxury feel and resale value of vehicles with leather interiors, and is recommended every 3-6 months depending on usage and climate conditions. Perfect for luxury vehicles, classic cars, or any vehicle where leather interior preservation is a priority.',
          price: '$60', 
          duration: '1.5 Hours' 
        }
      ],
      gridClass: 'col-12 col-md-6 col-lg-4'
    },
    'vehicle-wrap': {
      count: 4,
      services: [
        { 
          title: 'FULL VEHICLE WRAPS',
          description: 'We wrap it all…. cars, trucks, aircrafts, boats and trailers.',
          fullDescription: 'FULL VEHICLE WRAPS provide complete transformation and protection for your entire vehicle using premium vinyl films. Our expert technicians meticulously cover every panel, curve, and contour to deliver a flawless finish that looks like factory paint. We work with all vehicle types including cars, trucks, SUVs, boats, aircrafts, and trailers, adapting our techniques to each unique surface and design. Choose from an extensive range of finishes including gloss, satin, matte, chrome, metallic, carbon fiber, color-shift, and custom printed graphics. Our installation process includes thorough surface preparation, precise cutting and fitting, and professional heat application to ensure perfect adhesion and longevity. Full vehicle wraps offer complete paint protection while allowing for dramatic style changes, advertising opportunities, or personal expression. The high-quality films we use provide UV protection, scratch resistance, and can be removed without damaging the original paint. Perfect for businesses seeking mobile advertising, individuals wanting unique styling, or anyone looking to protect and transform their vehicles appearance.',
          price: 'From $2,799', 
          duration: '3 Hours' 
        },
        { 
          title: 'HOOD & ROOF WRAPS',
          description: 'Every roof or hood wrap in Gloss black is installed with the goal of perfection and a seamless finish.',
          fullDescription: 'HOOD & ROOF WRAPS offer an affordable way to dramatically enhance your vehicles appearance while providing protection to high-impact areas. These targeted wraps focus on the most visible surfaces of your vehicle, creating striking contrast and style without the cost of full vehicle coverage. Our precision installation ensures seamless, glass-like finishes that eliminate bubbles, dust, or imperfections. Available in premium gloss black, matte black, carbon fiber, and various color options to complement your vehicles existing paint. The hood and roof areas receive the most exposure to sun, weather, and road debris, making wrap protection particularly valuable for preserving paint condition and resale value. Our expert technicians use professional-grade vinyl films and heat application techniques to achieve perfect conformity around curves, edges, and body lines. The installation process includes thorough surface preparation, precise measurement and cutting, and quality control inspection to ensure flawless results. Perfect for adding sporty aesthetics, protecting high-wear areas, or creating custom two-tone looks at a fraction of full wrap cost.',
          price: 'Contact For Price', 
          duration: '3 Hours' 
        },
        {
          title: 'PARTIAL WRAPS',
          description: 'PARTIAL WRAPS provide flexible customization options for specific vehicle sections.',
          fullDescription: 'PARTIAL WRAPS provide flexible customization options for specific vehicle sections, allowing you to create unique design elements without full vehicle coverage. This service is perfect for accent pieces, racing stripes, logos, or decorative elements. Our technicians work with you to design custom layouts that complement your vehicles existing lines and features. The process includes design consultation, precision cutting of premium materials, and professional installation with attention to seamless integration. Ideal for businesses wanting branded elements, racing enthusiasts seeking performance aesthetics, or anyone wanting to personalize specific areas of their vehicle cost-effectively.',
          price: 'From $149.99',
          duration: '3 Hours'
        },
        { 
          title: 'WINDOW MOULDINGS (CHROME DELETES)',
          description: 'Transform your vehicles chrome trim with professional vinyl wrapping for a sleek, modern appearance.',
          fullDescription: 'WINDOW MOULDINGS (CHROME DELETES) service transforms your vehicles chrome window trim into sleek, modern accents using high-quality vinyl films. This popular modification eliminates the bright, reflective chrome elements around windows, door frames, and trim pieces, replacing them with sophisticated matte black, gloss black, or custom colored finishes. Our precision wrapping technique ensures complete coverage of all chrome surfaces while maintaining clean lines and professional appearance. The process includes thorough cleaning and preparation of chrome surfaces, careful measurement and cutting of premium vinyl materials, and expert application using heat and pressure for perfect adhesion. Chrome delete services create a more aggressive, contemporary look that complements modern vehicle styling trends. The vinyl protection also prevents chrome oxidation and corrosion while being completely reversible if desired. Popular with luxury vehicle owners, performance enthusiasts, and anyone seeking to modernize their vehicles appearance. Available in various finishes including matte black, gloss black, carbon fiber texture, and custom colors to match your vehicles aesthetic preferences.',
          price: 'From $349.99', 
          duration: '3 Hours' 
        }
      ],
      gridClass: 'col-12 col-md-6 col-lg-4'
    },
    'ceramic-coating': {
      count: 6,
      services: [
        { 
          title: 'CERAMIC PRO GOLD PACKAGE', 
          description: 'The Gold Package offered by Precision Auto Centre is the best package your vehicle can receive.', 
          fullDescription: 'Backed by a lifetime warranty, you will never have to worry about whether or not your vehicle is protected from harsh chemicals or road grime. The Gold package is a two-part application, like the silver package, taking generally two to three days to complete but does offer more protection for your vehicle than the silver package, 4x thicker to be exact. This is accomplished by layering 4 coats Ceramic Pro 9H onto your vehicles clear coat. By adding layers of Ceramic Pro 9H, you prolong the lifespan of the coating, ensuring that your vehicles paint is always protected when its out in the world. Your vehicle will receive four layers of Ceramic Pro 9H on all its painted surfaces and trim work. This will protect it against bird droppings, acidic chemicals found in insects, and water spotting on to your vehicle. Combined with a layer of Ceramic Pro Light, your vehicle will have a super slick and hydrophobic finished surface making anything stick to it virtually impossible. Also included in the Gold package is a layer of Ceramic Pro Rain on all of your vehicles glass surfaces (windshield, windows, mirrors, sunroof, etc.) and a layer of Ceramic Pro Wheel and Caliper on the face of the wheels. This will make cleaning brake dust off the wheels a breeze.\n\n Additionally at Precision Auto Centre we offer a service to remove the wheels from your vehicle and have the inside of the wheels cleaned and coated as well as the brake calipers to offer the most protection from brake dust building up and caking on to your wheels and to make cleaning them a breeze once they’re coated.\n\nNOTE: PAINT CORRECTION NOT INCLUDED IN PRICE',
          price: 'From $1,499', 
          duration: '2 Hours' 
        },
        { 
          title: 'CERAMIC PRO SILVER PACKAGE', 
          description: 'The Silver Package offered by Precision Auto Centre is a coating backed by a five-year warranty.', 
          fullDescription: 'The Silver Package offered by Precision Auto Centre is a coating backed by a five-year warranty that gives you peace of mind that your vehicle is receiving great protection from the harsh chemical and environmental substances that it will come in to contact with your vehicle during its time out in the world. The silver package is a two-part application that generally takes two to three days to complete (depending on paint correction) and coats your vehicles exterior entirely. The silver package combines Ceramic Pro 9H and Ceramic Pro Light to give your vehicle the two-part total package when it comes to protecting it. The Ceramic Pro 9H provides the chemical resistant property to protect your vehicles existing clear coat with a ceramic coating that is 3x stronger than its original factory clear coat. This will protect it from light scratching, bird droppings, acid rain and water spotting from etching in to your vehicles clear coat, always keeping your car looking new and glossy. Topped with Ceramic Pro Light twelve hours after Ceramic Pro 9H cures will accent the base coat and leave your vehicle with a slick and hydrophobic surface. The top coat makes it very difficult for substances to stick to your vehicles surfaces such as dirt, insects, tree sap, road tar, road paint, etc. Included in the silver package as well is Ceramic Pro Rain on all your vehicles glass surfaces (Windshield, windows, mirrors, sunroof, etc.) and a layer of Ceramic Pro Wheel and Caliper on the face of the wheels. This will make cleaning brake dust off the wheels a breeze.\n\n Additionally at Precision Auto Centre we offer a service to remove the wheels from your vehicle and have the inside of the wheels cleaned and coated as well as the brake calipers to offer the most protection from brake dust building up and caking on to your wheels and to make cleaning them a breeze once they’re coated.',
          price: 'From $899', 
          duration: '2 Hours' 
        },
        { 
          title: 'CERAMIC PRO BRONZE PACKAGE', 
          description: 'The Bronze package offered by Precision Auto Centre is a coating backed by a two-year warranty.', 
          fullDescription: 'The Bronze package offered by Precision Auto Centre is a coating backed by a two-year warranty for all of the painted surfaces of your vehicle. This package will keep your vehicle looking like new and help to protect your vehicles clear coat from environmental damage. The bronze package coats all your vehicles painted surfaces, headlights, taillights and plastic trim with Ceramic Pro Light which is the top coat used in Ceramic Pro gold and silver packages to provide a slick or (hydrophobic in technical terms) surface to your vehicle. The Bronze package also includes all your glass surfaces to be coated (windshield, mirrors, windows, sunroof, etc.) in our Ceramic Pro Rain product to provide a layer of resistance against water, dirt and ice to build up and a layer of Ceramic Pro Wheel and Caliper on the face of the wheels. While this package is a great introduction to Ceramic Pro products it does not include the Ceramic Pro 9H coating that offers the most protection for your vehicle against the harsh substances that it may come in to contact with on the road. With every package your vehicle is treated to a meticulous hand wash, decontamination and clay bar treatment to ensure that it is the cleanest possible surface to apply the Ceramic Pro bronze package to.\n\n Additionally at Precision Auto Centre we offer a service to remove the wheels from your vehicle and have the inside of the wheels cleaned and coated as well as the brake calipers to offer the most protection from brake dust building up and caking on to your wheels and to make cleaning them a breeze once they’re coated.',
          price: 'From $599', 
          duration: '2 Hours' 
        },
        { 
          title: 'CERAMIC PRO SPORT PACKAGE', 
          description: 'Ceramic Pro Sport is a product designed to replace the need for waxing your vehicle for six to eight months.', 
          fullDescription: 'Ceramic Pro Sport is a product designed to replace the need for waxing your vehicle for six to eight months. Precision Auto Centre offers this entry level Ceramic Pro package to give you a taste of what ceramic coatings can do for your vehicle. Ceramic Pro Sport is a sprayable coating that has 9% SiO2 “ceramic coating” is applied to the vehicle when wet after just being washed and bonds to the surfaces providing a layer of protection that is more durable and longer lasting than that of waxes and sealants. Unlike wax Ceramic Pro Sport is also a chemical resistant coating providing that extra protection for your vehicle to stand up for acidic properties and chemicals such as salt on the roads during the winter months.',
          price: 'From $349', 
          duration: '2 Hours' 
        },
        { 
          title: 'CERAMIC PRO INTERIOR PROTECTION', 
          description: 'Precision Auto Centre offers interior protection packages to keep your vehicles interior protected and easily cleaned and maintained.', 
          fullDescription: 'Precision Auto Centre offers interior protection packages to keep your vehicles interior protected and easily cleaned and maintained. Ceramic Pro Leather coating is applied to the leather surfaces of your vehicle creating a layer of protection between any food, drinks or dyes from jeans and your vehicles leather. By coating these surfaces, you can have the peace of mind knowing your vehicles white leather seats will be safe and protected from whatever is trying to stain them. One common question is, “Will it stop blue jean denim transfer?” the blue jean staining on light colored leathers is a big problem, answer is no. But it takes much longer for the staining to become noticeable. Best part is, just grab a damp cloth with water and it will wipe off. Makes cleaning lighter colored leather much easier.\n\n Ceramic Pro Textile is a coating designed for all the fabric materials in your vehicle’s interior. It is designed to bond to all types of fabric (cloth seats, micro suede, alcantara, etc.) to ensure that they are protected and easier to keep clean. Ceramic Pro Textile is a great way to keep your carpets, alcantara, floor mats, cloth seats and headliners clean and protected',
          price: 'From $599', 
          duration: '2 hours' 
        },
        { 
          title: 'PAINT FILM AND VINYL PROTECTION', 
          description: 'Precision Auto Centre offers an award-winning coating specifically designed to help protect your vehicles wrapped panels.', 
          fullDescription: 'Precision Auto Centre offers an award-winning coating specifically designed to help protect your vehicles wrapped panels. Whether your vehicle has a few panels protected with clear PPF (paint protection film) or it has a complete PPF wrap or vinyl colour change Ceramic Pro PPF and Vinyl is just the product to protect paint protection film and vinyl wraps. Receiving the honour of Best New Product at the SEMA 2017 show in Las Vegas. Ceramic Pro PPF and Vinyl will keep your vehicles newly acquired PPF and Vinyl accents looking fresh and clean preventing them from fading and staining over time. Ceramic Pro PPF and Vinyl is accompanied by a factory approved warranty designed to match the warranties provided by the PPF and Vinyl companies. Ceramic Pro PPF and Vinyl is a two-part coating process that takes generally two days to complete. The base coat is applied to the wrapped surfaces and left to cure, twelve hours later the top coat is applied to give your vehicles PPF and Vinyl the best all-around protection by protecting it with a chemical resistant layer and a slick, hydrophobic layer to prevent objects from sticking to your vehicle.',
          price: 'From $699', 
          duration: '2 Hours' 
        }
      ],
      gridClass: 'col-12 col-md-6 col-lg-4'
    },
    'paint-protection-film': {
      count: 3,
      services: [
        { 
          title: 'FULL VEHICLE PROTECTION KIT', 
          description: 'At Precision Auto Center we have our clients paint protection needs auto detailing needs in mind by offering clear bra film.', 
          fullDescription: 'At Precision Auto Center we have our clients paint protection needs auto detailing needs in mind by offering clear bra film. Clear bra, synonymous known as Paint Protection Film or PPF, is the “king” of the automotive paint protection industry and possesses the best protection technology available. These clear bra films are guaranteed to never crack, bubble or yellow overtime. The partial front kit offers durable protection that is a much thicker barrier for rock chips and flying debris. With the addition of clear bra paint protection, you’ll be protected from tree sap, rock chips, insect acids, brake dust, acid contaminants and additional debris. The partial front kit includes 24” of hood covering, fender coverage and clear bra film applied to the bumpers and mirrors.',
          price: 'From $1,299', 
          duration: '2 Hours' 
        },
        { 
          title: 'PARTIAL FRONT PROTECTION KIT', 
          description: 'At Precision Auto Center we have our clients paint protection needs auto detailing needs in mind by offering clear bra film.', 
          fullDescription: 'At Precision Auto Center we have our clients paint protection needs auto detailing needs in mind by offering clear bra film. Clear bra, synonymous known as Paint Protection Film or PPF, is the “king” of the automotive paint protection industry and possesses the best protection technology available. These clear bra films are guaranteed to never crack, bubble or yellow overtime. The partial front kit offers durable protection that is a much thicker barrier for rock chips and flying debris. With the addition of clear bra paint protection, you’ll be protected from tree sap, rock chips, insect acids, brake dust, acid contaminants and additional debris. The partial front kit includes 24” of hood covering, fender coverage and clear bra film applied to the bumpers and mirrors.',
          price: 'From $1,899', 
          duration: '3 Hours' 
        },
        { 
          title: 'FULL FRONT PROTECTION KIT', 
          description: 'At Precision Auto Center we have our clients paint protection needs auto detailing needs in mind by offering clear bra film.', 
          fullDescription: 'At Precision Auto Center we have our clients paint protection needs auto detailing needs in mind by offering clear bra film. Clear bra, synonymous known as Paint Protection Film or PPF, is the “king” of the automotive paint protection industry and possesses the best protection technology available. These clear bra films are guaranteed to never crack, bubble or yellow overtime. The partial front kit offers durable protection that is a much thicker barrier for rock chips and flying debris. With the addition of clear bra paint protection, you’ll be protected from tree sap, rock chips, insect acids, brake dust, acid contaminants and additional debris. The partial front kit includes 24” of hood covering, fender coverage and clear bra film applied to the bumpers and mirrors.',
          price: 'From $4,799', 
          duration: '3 Hours' 
        }
      ],
      gridClass: 'col-12 col-md-6 col-lg-4'
    },
    'powder-coating': {
      count: 0,
      services: [
        { 
          title: 'COMING SOON', 
          description: 'Professional refinishing with durable powder coating in various colors and finishes for enhanced appearance.', 
          fullDescription: 'Our upcoming POWDER COATING service will offer professional metal refinishing using durable powder coating technology. This process provides superior protection and appearance compared to traditional liquid paint, with enhanced durability, chemical resistance, and color retention. The service will include surface preparation, media blasting if needed, and application of high-quality powder coating in a wide range of colors and finishes. Perfect for wheels, trim pieces, brackets, and other metal components that need both protection and aesthetic enhancement. Stay tuned for the official launch of this exciting service expansion.',
          price: 'TBD', 
          duration: 'TBD' 
        }
      ],
      gridClass: 'col-12 col-md-6 col-lg-4'
    },
    'window-tinting': {
      count: 5,
      services: [
        { 
          title: 'FRONT 2 WINDOWS', 
          description: 'Driver and Passenger side windows', 
          fullDescription: 'FRONT 2 WINDOWS tinting provides professional installation on your vehicles front driver and passenger side windows using premium heat-rejecting films. This targeted service focuses on the most frequently used windows, offering immediate benefits of reduced glare, enhanced privacy, and protection from harmful UV rays. Our skilled technicians use precision cutting and professional installation techniques to ensure bubble-free, perfectly fitted tint that meets legal requirements while maximizing performance. The high-quality films provide interior surface protection from premature aging, helping preserve dashboards, seats, and trim from sun damage. Advanced heat rejection technology keeps your cabin cooler, reducing air conditioning usage and improving fuel efficiency. The lifetime warranty covers adhesive failure, peeling, delamination, fading, and cracking, ensuring long-lasting performance. Perfect for drivers seeking essential window tinting benefits at an affordable price point, or as a starting point before upgrading to full vehicle coverage.',
          price: '$119.99', 
          duration: '1-2 hours' 
        },
        { 
          title: 'FULL VEHICLE', 
          description: 'Windshield not included', 
          fullDescription: 'FULL VEHICLE window tinting delivers comprehensive protection and style enhancement for all side and rear windows, excluding the windshield for legal compliance. This complete tinting solution provides maximum privacy, heat rejection, and UV protection throughout your entire passenger compartment. Our professional installation covers all four side windows plus the rear window using premium films that block harmful UV rays, reduce interior heat buildup, and prevent glare from affecting your driving experience. The service includes precise measurement, computer-aided cutting, and expert installation to ensure perfect fit and finish on every window surface. Advanced heat rejection technology significantly reduces cabin temperature, lowering air conditioning costs and improving overall comfort for all passengers. The comprehensive coverage protects all interior surfaces from sun damage, preventing fading and cracking of seats, dashboard, and trim materials. Each installation includes thorough cleaning, professional application, and quality inspection to guarantee bubble-free, long-lasting results. Backed by our lifetime warranty against adhesive failure, peeling, delamination, fading, and cracking, this service provides complete vehicle transformation and protection.',
          price: '$219.99', 
          duration: '2-3 hours' 
        },
        { 
          title: 'WINDSHIELD', 
          description: 'Windshield tinting', 
          fullDescription: 'WINDSHIELD tinting provides advanced protection and comfort enhancement for your vehicles front windshield using specialized films designed for maximum visibility and legal compliance. This premium service applies nearly invisible, high-performance films that dramatically reduce heat transmission while maintaining optimal clarity for safe driving. Our windshield tinting uses advanced nano-ceramic technology that blocks infrared heat rays without interfering with GPS, cellular, or radio signals. The specialized films provide superior glare reduction, making driving more comfortable in bright sunlight conditions while protecting your eyes from harmful UV radiation. Professional installation requires precise techniques to ensure perfect adhesion and bubble-free application across the curved windshield surface. The service significantly reduces interior temperature, lessening the burden on air conditioning systems and improving fuel efficiency. Windshield tinting helps protect dashboard and interior surfaces from UV damage while reducing eye strain during long drives. Our premium films meet legal transmission requirements while providing maximum heat rejection performance. Installation includes thorough surface preparation, precision cutting, and expert application backed by our comprehensive lifetime warranty against defects and performance degradation.',
          price: '$149.99', 
          duration: '1-2 hours' 
        },
        { 
          title: 'WINDSHIELD BROW TINT', 
          description: 'Windshield brow strip tinting', 
          fullDescription: 'WINDSHIELD BROW TINT involves applying a precisely measured tinted strip across the top portion of your windshield to reduce glare and enhance driving comfort. This affordable enhancement targets the most problematic area for sun glare, providing immediate relief from bright sunlight and overhead lighting conditions. Our professional installation creates a smooth transition from the tinted brow area to the clear windshield, maintaining excellent visibility while dramatically reducing eye strain. The service uses high-quality films that block harmful UV rays and reduce heat transmission through the upper windshield area where sun exposure is most direct. Installation requires careful measurement to ensure the tint strip complies with legal height requirements while maximizing glare reduction benefits. The precision-cut film provides seamless integration with your windshield appearance, creating a subtle yet effective solution for sun protection. This cost-effective upgrade significantly improves driving comfort during morning and evening commutes when sun angle creates the most challenging visibility conditions. The tinted brow strip also helps protect dashboard and interior surfaces from direct UV exposure. Perfect for drivers seeking targeted glare reduction without full windshield tinting, offering professional results at an accessible price point.',
          price: '$79.99', 
          duration: '30-60 mins' 
        },
        { 
          title: 'AIRCRAFTS', 
          description: 'Please call for price inquiry', 
          fullDescription: 'AIRCRAFTS window tinting provides specialized protective films designed specifically for aviation applications, addressing the unique challenges of high-altitude UV exposure and intense solar radiation. Our certified technicians understand the specific requirements for aircraft window films, including compliance with aviation safety standards and regulations. Aircraft windows face extreme conditions including rapid temperature changes, intense UV radiation at altitude, and specialized cleaning requirements that demand premium-grade materials and expert installation. The service includes comprehensive consultation to determine appropriate film specifications based on aircraft type, usage patterns, and regulatory requirements. Our aviation-grade films provide superior heat rejection, UV protection, and glare reduction while maintaining critical visibility standards required for safe flight operations. Installation requires specialized techniques adapted to aircraft window configurations, curved surfaces, and unique mounting systems. The films help protect aircraft interiors from sun damage, reduce cabin heat buildup, and improve passenger comfort during flight. Each installation includes thorough documentation and certification to meet aviation maintenance standards. Contact us for detailed consultation, regulatory compliance verification, and custom pricing based on your specific aircraft requirements and installation scope.',
          price: 'Contact Us', 
          duration: 'N/A' 
        }
      ],
      gridClass: 'col-12 col-md-6 col-lg-4'
    }
  })

  const [currentActiveService, setCurrentActiveService] = useState('detailing');
  
  // Booking modal state - exactly like original
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState('calendar'); // 'calendar' or 'form'
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    requests: ''
  });
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vehicleInfo: '',
    specialRequests: ''
  });
  
  // Booking status state
  const [bookingStatus, setBookingStatus] = useState({
    loading: false,
    success: false,
    error: null,
    bookingReference: null
  });

  // Handle URL parameters for service selection (exactly like original)
  useEffect(() => {
    if (!loading && Object.keys(serviceContent).length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceParam = urlParams.get('service');
      if (serviceParam && serviceContent[serviceParam]) {
        setCurrentActiveService(serviceParam);
      }
    }
  }, [router.query, loading, serviceContent]);

  // Resolution-based column management to handle responsive layout
  useEffect(() => {
    // Function to get current screen resolution and apply appropriate column classes
    const handleResolutionChange = () => {
      if (typeof window === 'undefined') return;

      const screenWidth = window.innerWidth;
      console.log('Screen width:', screenWidth);

      // Find all service container columns
      const serviceContainers = document.querySelectorAll('.service-containers .row > div');

      serviceContainers.forEach(container => {
        // Remove all existing column classes
        container.classList.remove('col-12', 'col-md-6', 'col-lg-4', 'col-sm-12');

        // Apply appropriate classes based on screen width
        // Using higher breakpoints to prevent overlapping
        if (screenWidth >= 1200) {
          // Large Desktop: 3 columns (xl)
          container.classList.add('col-lg-4');
          console.log('Applied large desktop layout (3 columns)');
        } else if (screenWidth >= 800) {
          // Medium screens and tablets: 2 columns (earlier transition)
          container.classList.add('col-md-6');
          console.log('Applied tablet layout (2 columns)');
        } else {
          // Small screens and mobile: 1 column
          container.classList.add('col-12');
          console.log('Applied mobile layout (1 column)');
        }
      });

      // Force layout recalculation to prevent overlapping
      const serviceRows = document.querySelectorAll('.service-containers .row');
      serviceRows.forEach(row => {
        // Trigger reflow by temporarily hiding and showing
        row.style.display = 'none';
        row.offsetHeight; // Force browser to recalculate layout
        row.style.display = 'flex';

        // Force flex-wrap to be applied
        row.style.flexWrap = 'wrap';
      });

      // Additional fix: Force width recalculation on all service containers
      serviceContainers.forEach(container => {
        container.style.transition = 'all 0.2s ease';
        container.offsetWidth; // Force reflow
      });

      // Recalculate page height after layout change
      setTimeout(() => {
        if (typeof calculatePageHeight === 'function') {
          calculatePageHeight();
        }
      }, 50);
    };

    // Initial resolution check
    setTimeout(handleResolutionChange, 100);

    // Add resize event listener with debouncing for performance
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResolutionChange, 150);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [currentActiveService]); // Re-run when service changes

  // Function to open service detail modal
  const openServiceDetailModal = (serviceKey, serviceIndex) => {
    console.log('Opening service detail modal:', serviceKey, serviceIndex);
    const service = serviceContent[serviceKey];
    const serviceItem = service.services[serviceIndex];
    const serviceDetail = {
      ...serviceItem,
      serviceKey,
      serviceIndex
    };
    console.log('Setting selectedServiceDetail to:', serviceDetail);
    setSelectedServiceDetail(serviceDetail);
    setShowServiceDetailModal(true);
    
    // Scroll to top of page when modal opens and recalculate height
    setTimeout(() => {
      window.scrollTo({
        top: 10,
        behavior: 'smooth'
      });
      calculatePageHeight();
    }, 100);
  };

  // Function to close service detail modal
  const closeServiceDetailModal = () => {
    console.log('Closing service detail modal');
    setShowServiceDetailModal(false);
    setSelectedServiceDetail(null);

    // Recalculate height after modal closes
    setTimeout(() => {
      calculatePageHeight();
    }, 100);
  };

  // Function to check if service needs two-column layout (detailing, window tinting, PPF services, or PARTIAL WRAPS)
  const needsTwoColumnLayout = (serviceTitle, serviceObject = null) => {
    const features = getServiceFeatures(serviceTitle, serviceObject);
    const hasExteriorInterior = features.some(f => f.type === 'heading' && (f.text === 'Exterior' || f.text === 'Interior'));

    // Window tinting services should also use two-column layout
    const windowTintingServices = ['FRONT 2 WINDOWS', 'FULL VEHICLE', 'WINDSHIELD', 'WINDSHIELD BROW TINT', 'AIRCRAFTS'];
    const isWindowTinting = windowTintingServices.includes(serviceTitle);

    // PPF services should also use two-column layout
    const ppfServices = ['FULL VEHICLE PROTECTION KIT', 'PARTIAL FRONT PROTECTION KIT', 'FULL FRONT PROTECTION KIT'];
    const isPPF = ppfServices.includes(serviceTitle);

    // PARTIAL WRAPS should also use two-column layout
    const isPartialWraps = serviceTitle === 'PARTIAL WRAPS';

    // ODOR REMOVAL should also use two-column layout
    const isOdorRemoval = serviceTitle === 'ODOR REMOVAL';

    // WASH ME should also use two-column layout
    const isWashMe = serviceTitle === 'WASH ME';

    // LEATHER TREATMENT should also use two-column layout
    const isLeatherTreatment = serviceTitle === 'LEATHER TREATMENT';

    return hasExteriorInterior || isWindowTinting || isPPF || isPartialWraps || isOdorRemoval || isWashMe || isLeatherTreatment;
  };

  // Function to get service features based on service title - from reference.js
  const getServiceFeatures = (serviceTitle, serviceObject = null) => {
    // If we have a service object with JSONB data, use it
    if (serviceObject) {
      const features = [];

      // Add what's included section if available
      if (serviceObject.whats_included && serviceObject.whats_included.length > 0) {
        features.push(...serviceObject.whats_included);
      }

      // Add exterior points with heading if available
      if (serviceObject.exterior_points && serviceObject.exterior_points.length > 0) {
        features.push({ type: 'heading', text: 'Exterior' });
        features.push(...serviceObject.exterior_points);
      }

      // Add interior points with heading if available
      if (serviceObject.interior_points && serviceObject.interior_points.length > 0) {
        features.push({ type: 'heading', text: 'Interior' });
        features.push(...serviceObject.interior_points);
      }

      // Add specifications with heading if available
      if (serviceObject.specifications && serviceObject.specifications.length > 0) {
        features.push({ type: 'heading', text: 'Specifications:' });
        features.push(...serviceObject.specifications);
      }

      // Add film features with heading if available
      if (serviceObject.film_features && serviceObject.film_features.length > 0) {
        features.push({ type: 'heading', text: 'Film Features:' });
        features.push(...serviceObject.film_features);
      }

      return features;
    }

    // Fallback to hardcoded features for backward compatibility
    const features = {
      'PRECISION PACKAGE': [
        { type: 'heading', text: 'Exterior' },
        'Full Foam & Hand Wash of Entire Vehicle',
        'Full Rim Detail',
        'Paint Decontamination',
        'Full Engine Bay Detail',
        'Air Dry Vehicle',
        'Clean door jambs',
        'Single stage paint correction',
        'Sealant Wax',
        'Tire Dressing',
        { type: 'heading', text: 'Interior' },
        'Interior Vacuum',
        'Steam Clean Carpets, Seats & Vents',
        'Clean Mats',
        'Salt Removal',
        'Clean all glass windows',
        'Interior Matte Cleaner Protectant'
      ],
      'GOLD PACKAGE': [
        { type: 'heading', text: 'Exterior' },
        'Full Foam & Hand Wash of Entire Vehicle',
        'Full Rim Detail',
        'Air Dry Vehicle',
        'Clean door jambs',
        'Tire Dressing',
        { type: 'heading', text: 'Interior' },
        'Interior Vacuum',
        'Steam Clean Carpets, Seats & Vents',
        'Clean Mats',
        'Salt Removal',
        'Interior Matte Cleaner Protectant',
        'Clean all glass windows'
      ],
      'BRONZE PACKAGE': [
        { type: 'heading', text: 'Exterior' },
        'Full Foam & Hand Wash of Entire Vehicle',
        'Full Rim Detail',
        'Dry Vehicle',
        'Clean door jambs',
        'Tire Dressing',
        { type: 'heading', text: 'Interior' },
        'Interior Vacuum',
        'Clean Carpets, Seats & Vents',
        'Clean all glass windows',
        'Interior Matte Cleaner Protectant',
        'Clean Mats'
      ],
      'ODOR REMOVAL': [
        'Everything Included from Gold Package (RECOMMENDED)',
        '2 Hour Odor Eliminator Treatment'
      ],
      'WASH ME': [
        'Two-bucket wash method'
      ],
      'LEATHER TREATMENT': [
        'Enhanced durability treatment'
      ],
      'FULL VEHICLE PROTECTION KIT': [
        'Full hood',
        'Full fenders',
        'Mirrors',
        'Full front bumper',
        'Headlights and Fog Lights',
        'Door Cups',
        { type: 'heading', text: 'Film Features:' },
        'Warrantied color-stable',
        'Excellent durability and resistance to yellowing and cracking',
        'Self-healing technology that makes most scratches disappear',
        'Invisible Gloss or Matte',
        'Exceptional clarity with low "orange peel"',
        '10-year, North America wide warranty'
      ],
    'PARTIAL FRONT PROTECTION KIT': [
      '24″ of Paint Protection Film on Hood',
      '24" of Paint Protection Film on Fenders',
      'Full Front Bumper',
      'Side Mirrors',
      { type: 'heading', text: 'Film Features :' },
      'Warrantied color-stable',
      'Excellent durability and resistance to yellowing and cracking',
      'Self-healing technology that makes most scratches disappear',
      'Invisible Gloss or Matte',
      'Exceptional clarity with low "orange peel"',
      '10-year, North America wide warranty'
    ],
    'FULL FRONT PROTECTION KIT': [
      'Full hood',
      'Full fenders',
      'Mirrors',
      'Full front bumper',
      'Headlights and Fog Lights',
      'Door Cups',
      { type: 'heading', text: 'Film Features :' },
      'Warrantied color-stable',
      'Excellent durability and resistance to yellowing and cracking',
      'Self-healing technology that makes most scratches disappear',
      'Invisible Gloss or Matte',
      'Exceptional clarity with low "orange peel"',
      '10-year, North America wide warranty'
    ],
    'FULL VEHICLE WRAPS': [

    ],
    'HOOD & ROOF WRAPS': [

    ],
    'PARTIAL WRAPS': [
      'Roof | $299.99+',
      'Interior | $499.99+',
      'Spoiler | $149.99+',
      'Side Mirror | $179.99+',
      'Diffuser | $449.99+',
      'Window Moulding | $349.99'
    ],
    'WINDOW MOULDINGS (CHROME DELETES)': [

    ],
    'CERAMIC PRO GOLD PACKAGE': [

    ],
    'CERAMIC PRO SILVER PACKAGE': [

    ],
    'CERAMIC PRO BRONZE PACKAGE': [

    ],
    'CERAMIC PRO SPORT PACKAGE': [

    ],
    'CERAMIC PRO INTERIOR PROTECTION': [

    ],
    'PAINT FILM AND VINYL PROTECTION': [

    ],
    'COMING SOON': [

    ],
    'FRONT 2 WINDOWS': [
      'Interior Surface Protection from Premature Aging',
      'Increased Privacy',
      'Heat Rejecting Technology',
      'Shatter Resistant Films',
      'Non-Reflective',
      'Protection from Heat, UV and Infrared',
      'Added Skin Protection & Privacy',
      'Lifetime warranty Against: Adhesive Failure, Peeling, Delamination, Fading and Cracking'
    ],
    'FULL VEHICLE': [
      'Interior Surface Protection from Premature Aging',
      'Increased Privacy',
      'Heat Rejecting Technology',
      'Shatter Resistant Films',
      'Non-Reflective',
      'Protection from Heat, UV and Infrared',
      'Added Skin Protection & Privacy',
      'Lifetime warranty Against: Adhesive Failure, Peeling, Delamination, Fading and Cracking'
    ],
    'WINDSHIELD': [
      'Interior Surface Protection from Premature Aging',
      'Increased Privacy',
      'Heat Rejecting Technology',
      'Shatter Resistant Films',
      'Non-Reflective',
      'Protection from Heat, UV and Infrared',
      'Added Skin Protection & Privacy',
      'Lifetime warranty Against: Adhesive Failure, Peeling, Delamination, Fading and Cracking'
    ],
    'WINDSHIELD BROW TINT': [
      'Interior Surface Protection from Premature Aging',
      'Increased Privacy',
      'Heat Rejecting Technology',
      'Shatter Resistant Films',
      'Non-Reflective',
      'Protection from Heat, UV and Infrared',
      'Added Skin Protection & Privacy',
      'Lifetime warranty Against: Adhesive Failure, Peeling, Delamination, Fading and Cracking'
    ],
    'AIRCRAFTS': [
      'Aviation-Grade Window Films',
      'High-Altitude UV Protection',
      'Glare Reduction for Safety',
      'Regulatory Compliance Verification',
      'Marine Application Available',
      'Saltwater Resistant Materials',
      'Professional Consultation Included',
      'Custom Pricing Based on Requirements'
    ]

    };
    
    return features[serviceTitle] || ['Professional service with quality products', 'Expert technicians', 'Satisfaction guaranteed'];
  };

  // Function to create service containers exactly like original
  function createServiceContainers(serviceKey) {
    const service = serviceContent[serviceKey];
    if (!service) return null;

    return (
      <div className="row g-4 mt-4">
        {service.services.map((item, index) => {
          const delay = index * 0.2;
          let imageSrc = `images/service-${(index % 6) + 1}.jpg`;
          
          // Use specific images for different services - exactly like original
          if (serviceKey === 'ceramic-coating') {
            imageSrc = 'images/ceramicpro.png';
          } else if (serviceKey === 'vehicle-wrap') {
            imageSrc = 'images/3m.jpg';
          } else if (serviceKey === 'paint-protection-film') {
            imageSrc = 'images/ultimate.png';
          } else if (serviceKey === 'window-tinting') {
            imageSrc = 'images/xpel-01.jpg';
          } else if (serviceKey === 'detailing') {
            switch(item.title) {
              case 'PRECISION PACKAGE':
                imageSrc = '/images/black.png';
                break;
              case 'GOLD PACKAGE':
                imageSrc = '/images/gold.png';
                break;
              case 'BRONZE PACKAGE':
                imageSrc = '/images/bronze.png';
                break;
              case 'ODOR REMOVAL':
                imageSrc = '/images/odor.png';
                break;
              case 'WASH ME':
                imageSrc = '/images/washme.jpeg';
                break;
              case 'LEATHER TREATMENT':
                imageSrc = 'images/leather.avif';
                break;
              default:
                imageSrc = `images/service-${(index % 6) + 1}.jpg`;
            }
          }

          return (
            <div key={index} className={service.gridClass}>
              <div className="service-container" style={{ position: 'relative' }}>
                <div className="service-badge wow fadeInUp" data-wow-delay={`${delay}s`}>
                  <img src={imageSrc} alt={item.title} />
                </div>
                
                <div className="service-card-new bg-gray rounded-1 h-100 wow fadeInUp" data-wow-delay={`${delay}s`}>
                  <h4 className="service-title mb-2 text-white">{item.title}</h4>
                  <div className="subtitle-line mb-2"></div>
                  <div className="service-duration text-white small mb-3 text-start">{item.duration || ''}</div>
                  <p className="service-description text-light mb-3">
                    {item.description}
                    {item.fullDescription && (
                      <span 
                        className="read-more-link" 
                        onClick={() => openServiceDetailModal(serviceKey, index)}
                        style={{ 
                          color: '#ff4444', 
                          cursor: 'pointer', 
                          textDecoration: 'underline', 
                          fontWeight: '500', 
                          marginLeft: '5px' 
                        }}
                      >
                        More Info
                      </span>
                    )}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="service-price text-white fw-bold fs-6">{item.price || 'Contact for Price'}</div>
                    <button 
                      className="book-now-btn btn-main fx-slide btn-sm" 
                      data-service={item.title} 
                      data-price={item.price} 
                      data-duration={item.duration}
                      style={{ 
                        padding: '8px 12px', 
                        fontSize: '12px',
                        ...(serviceKey === 'powder-coating' ? { opacity: '0.5', cursor: 'not-allowed', pointerEvents: 'none' } : {})
                      }}
                      disabled={serviceKey === 'powder-coating'}
                      title={serviceKey === 'powder-coating' ? 'Coming Soon' : ''}
                      onClick={(e) => handleBookNowClick(e, item)}
                    >
                      <span>BOOK NOW</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Handle service toggle button clicks - exactly like original
  const handleServiceToggle = (serviceKey) => {
    setCurrentActiveService(serviceKey);
    // Close service detail modal when switching services
    if (showServiceDetailModal) {
      setShowServiceDetailModal(false);
      setSelectedServiceDetail(null);
    }

    // Recalculate page height when toggle is pressed
    setTimeout(() => {
      calculatePageHeight();
    }, 50);

    // Let React handle the rendering via createServiceContainers(currentActiveService)
  };

  // Create service container HTML (helper for dynamic updates)
  const createServiceContainerHTML = (serviceKey) => {
    const service = serviceContent[serviceKey];
    if (!service) return '';
    
    let html = '<div class="row g-4 mt-4">';
    
    service.services.forEach((item, index) => {
      const delay = index * 0.2;
      let imageSrc = `images/service-${(index % 6) + 1}.jpg`;
      
      if (serviceKey === 'ceramic-coating') {
        imageSrc = 'images/ceramicpro.png';
      } else if (serviceKey === 'vehicle-wrap') {
        imageSrc = 'images/3m.jpg';
      } else if (serviceKey === 'paint-protection-film') {
        imageSrc = 'images/ultimate.png';
      } else if (serviceKey === 'window-tinting') {
        imageSrc = 'images/xpel-01.jpg';
      } else if (serviceKey === 'detailing') {
        switch(item.title) {
          case 'PRECISION PACKAGE':
            imageSrc = '/images/black.png';
            break;
          case 'GOLD PACKAGE':
            imageSrc = '/images/gold.png';
            break;
          case 'BRONZE PACKAGE':
            imageSrc = '/images/bronze.png';
            break;
          case 'ODOR REMOVAL':
            imageSrc = '/images/odor.png';
            break;
          case 'WASH ME':
            imageSrc = '/images/washme.jpeg';
            break;
          case 'LEATHER TREATMENT':
            imageSrc = 'images/leather.avif';
            break;
          default:
            imageSrc = `images/service-${(index % 6) + 1}.jpg`;
        }
      }
      
      html += `
        <div class="${service.gridClass}">
          <div class="service-container" style="position: relative;">
            <div class="service-badge wow fadeInUp" data-wow-delay="${delay}s">
              <img src="${imageSrc}" alt="${item.title}" />
            </div>
            
            <div class="service-card-new bg-gray rounded-1 h-100 wow fadeInUp" data-wow-delay="${delay}s">
              <h4 class="service-title mb-2 text-white">${item.title}</h4>
              <div class="subtitle-line mb-2"></div>
              <div class="service-duration text-white small mb-3 text-start">${item.duration || ''}</div>
              <p class="service-description text-light mb-3">${item.description}</p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="service-price text-white fw-bold fs-6">${item.price || 'Contact for Price'}</div>
                <button class="book-now-btn btn-main fx-slide btn-sm" data-service="${item.title}" data-price="${item.price}" data-duration="${item.duration}" style="padding: 8px 12px; font-size: 12px;${serviceKey === 'powder-coating' ? ' opacity: 0.5; cursor: not-allowed; pointer-events: none;' : ''}" ${serviceKey === 'powder-coating' ? 'disabled title="Coming Soon"' : ''}>
                  <span>BOOK NOW</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  };

  // Open booking modal - exactly like original
  const openBookingModal = (serviceTitle, servicePrice, serviceDuration, serviceDescription = '') => {
    setSelectedService({
      title: serviceTitle,
      price: servicePrice,
      duration: serviceDuration,
      description: serviceDescription
    });

    // Reset booking state
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingStep('calendar');
    setBookingSuccess(false);
    setBookingError('');
    setBookingStatus({
      loading: false,
      success: false,
      error: null,
      bookingReference: null
    });
    setShowBookingModal(true);
  };

  // Close booking modal - restore services content
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingStep('calendar');
    setBookingSuccess(false);
    setBookingError('');
  };

  // Handle book now button clicks - exactly like original
  const handleBookNowClick = (e, service) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (service.title === 'COMING SOON') return;
    
    const serviceDescription = service.description || 'Professional auto service at Precision Auto Center.';
    openBookingModal(service.title, service.price, service.duration, serviceDescription);
  };

  // Time formatting utilities - exactly like original
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const convertTo24Hour = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  // Fetch available time slots from database - exactly like original
  const fetchAvailableTimeSlots = async (date) => {
    try {
      setIsLoading(true);
      // Format date as YYYY-MM-DD without timezone conversion
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log('🚀 FIXED: Fetching SERVICE-SPECIFIC availability for date:', dateStr);
      console.log('🎯 Service duration:', selectedService?.duration);

      // Use service-specific endpoint with reverse blocking
      const response = await fetch(`/api/check-availability-for-service?date=${dateStr}&duration=${encodeURIComponent(selectedService?.duration || '2 Hours')}`);
      
      console.log('Response status:', response.status);
      
      // Get response text first to debug (even for errors)
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}\nServer Response: ${responseText}`);
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response was not valid JSON:', responseText);
        throw new Error(`Server returned invalid JSON. Response: ${responseText.substring(0, 200)}`);
      }
      
      console.log('Parsed data:', data);
      console.log('Available slots:', data.availableSlots);
      console.log('Booked slots:', data.bookedSlots);
      console.log('All slots:', data.allTimeSlots);
      
      if (!data.success) {
        const message = data.message || 'Error loading available times';
        console.error('API returned success=false:', message);
        setAvailableTimeSlots([]);
        return;
      }

      // Show only available time slots (hide booked ones completely)
      const availableSlots = data.availableSlots || [];
      
      console.log('Processing available slots only:', availableSlots);
      
      if (availableSlots.length === 0) {
        console.log('No times available for this date');
        setAvailableTimeSlots([]);
        return;
      }
      
      setAvailableTimeSlots(availableSlots);
      console.log(`Set ${availableSlots.length} available time slots`);
      
    } catch (error) {
      console.error('Error loading time slots:', error);
      // Show error message to user instead of fallback
      setAvailableTimeSlots([]);
      setBookingError(`Error loading available times: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    setBookingStatus({
      loading: true,
      success: false,
      error: null,
      bookingReference: null
    });
    
    try {
      // Validate required fields
      if (!bookingForm.customerName || !bookingForm.customerEmail || !bookingForm.customerPhone) {
        throw new Error('Please fill in all required fields (Name, Email, Phone)');
      }
      
      if (!selectedDate || !selectedTime || !selectedService) {
        throw new Error('Please select a service, date, and time');
      }
      
      // Prepare booking data
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const bookingData = {
        name: bookingForm.customerName,
        email: bookingForm.customerEmail,
        phone: bookingForm.customerPhone,
        vehicle: bookingForm.vehicleInfo,
        requests: bookingForm.specialRequests,
        service: selectedService.title,
        date: formattedDate, // Format as YYYY-MM-DD without timezone conversion
        time: selectedTime,
        duration: selectedService.duration,
        price: selectedService.price
      };
      
      console.log('Submitting booking data:', bookingData);
      
      const response = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}\nServer Response: ${responseText}`);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Server returned invalid JSON. Response: ${responseText.substring(0, 200)}`);
      }
      
      console.log('Booking result:', result);
      
      if (result.success) {
        // Save user details to localStorage for next time
        const userDetails = {
          name: bookingForm.customerName,
          email: bookingForm.customerEmail,
          phone: bookingForm.customerPhone,
          vehicle: bookingForm.vehicleInfo,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem('pac_user_details', JSON.stringify(userDetails));
        
        setBookingStatus({
          loading: false,
          success: true,
          error: null,
          bookingReference: result.booking_reference
        });
        
        // Disable form after successful booking
        const form = e.target;
        form.style.opacity = '0.6';
        form.style.pointerEvents = 'none';
        
      } else {
        throw new Error(result.message || 'Booking failed');
      }
      
    } catch (error) {
      console.error('Booking Error:', error);
      setBookingStatus({
        loading: false,
        success: false,
        error: error.message || 'Sorry, there was an error processing your booking. Please try again.',
        bookingReference: null
      });
      
      // If it's a time slot conflict, refresh available slots
      const errorMsg = error.message || '';
      if (errorMsg.toLowerCase().includes('time slot') || 
          errorMsg.toLowerCase().includes('no longer available') ||
          errorMsg.toLowerCase().includes('conflict')) {
        
        console.log('Time slot conflict detected, refreshing available slots...');
        setTimeout(() => {
          if (selectedDate) {
            fetchAvailableTimeSlots(selectedDate);
          }
        }, 2000);
      }
    }
  };

  // Load saved user details on form init
  const loadSavedUserDetails = () => {
    try {
      const saved = localStorage.getItem('pac_user_details');
      if (saved) {
        const userDetails = JSON.parse(saved);
        setBookingForm(prev => ({
          ...prev,
          customerName: userDetails.name || '',
          customerEmail: userDetails.email || '',
          customerPhone: userDetails.phone || '',
          vehicleInfo: userDetails.vehicle || ''
        }));
        console.log('Loaded saved user details');
      }
    } catch (error) {
      console.error('Error loading saved user details:', error);
    }
  };

  // Load saved details when booking step changes to form
  useEffect(() => {
    if (bookingStep === 'form') {
      loadSavedUserDetails();
    }
  }, [bookingStep]);

  // Generate calendar - exactly like original business logic
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    const calendar = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = date < today.setHours(0, 0, 0, 0);
      const dayOfWeek = date.getDay();
      const isBusinessDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
      
      calendar.push({
        day,
        date,
        isPast,
        isBusinessDay,
        available: !isPast && isBusinessDay
      });
    }
    
    return calendar;
  };

  // Handle date selection
  const handleDateSelect = async (dateObj) => {
    if (!dateObj.available) return;
    setSelectedDate(dateObj.date);
    setSelectedTime(null);
    setBookingError(''); // Clear any previous errors
    
    // Fetch available time slots for the selected date
    await fetchAvailableTimeSlots(dateObj.date);
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // Auto-refresh functionality after successful booking (like original booking-integration.js)
  useEffect(() => {
    const handleBookingSuccess = () => {
      if (selectedDate) {
        console.log('Booking successful, refreshing time slots...');
        // Refresh available time slots for the current date
        fetchAvailableTimeSlots(selectedDate);
        setSelectedTime(null); // Clear selected time
      }
    };

    // Listen for booking success events
    document.addEventListener('bookingSuccess', handleBookingSuccess);
    
    return () => {
      document.removeEventListener('bookingSuccess', handleBookingSuccess);
    };
  }, [selectedDate]);

  // Ensure all book now buttons work via event delegation
  useEffect(() => {
    const handleGlobalBookNow = (e) => {
      const bookBtn = e.target.closest('.book-now-btn');
      if (bookBtn && !bookBtn.disabled) {
        e.preventDefault();
        e.stopPropagation();
        
        const service = {
          title: bookBtn.getAttribute('data-service'),
          price: bookBtn.getAttribute('data-price'),
          duration: bookBtn.getAttribute('data-duration')
        };
        
        console.log('Book now clicked:', service); // Debug log
        
        if (service.title && service.title !== 'COMING SOON') {
          const serviceDescription = `Professional ${service.title.toLowerCase()} service at Precision Auto Center.`;
          console.log('Opening booking modal for:', service.title); // Debug log
          openBookingModal(service.title, service.price, service.duration, serviceDescription);
        }
      }
    };

    document.addEventListener('click', handleGlobalBookNow, true); // Use capture phase
    return () => document.removeEventListener('click', handleGlobalBookNow, true);
  }, []);

  // Dynamic layout calculation based on content
  const calculatePageHeight = () => {
    if (typeof window !== 'undefined') {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const content = document.querySelector('.services-page');
      const wrapper = document.getElementById('wrapper');

      if (header && footer && content && wrapper) {
        const headerHeight = header.offsetHeight;
        const footerHeight = footer.offsetHeight;
        const windowHeight = window.innerHeight;

        // Reset wrapper height first to get accurate content measurement
        wrapper.style.height = 'auto';
        wrapper.style.minHeight = '100vh';

        // Wait for DOM to update, then measure actual content
        setTimeout(() => {
          const contentChildren = content.children;
          let totalContentHeight = 0;

          for (let i = 0; i < contentChildren.length; i++) {
            totalContentHeight += contentChildren[i].offsetHeight;
          }

          // Add padding
          totalContentHeight += 80;

          // Calculate required total height
          const minRequiredHeight = headerHeight + totalContentHeight + footerHeight;

          if (minRequiredHeight > windowHeight) {
            // Content exceeds viewport - use content height
            wrapper.style.height = minRequiredHeight + 'px';
            wrapper.style.minHeight = minRequiredHeight + 'px';
            content.style.minHeight = totalContentHeight + 'px';
          } else {
            // Content fits in viewport - use viewport height
            wrapper.style.height = '100vh';
            wrapper.style.minHeight = '100vh';
            const availableContentHeight = windowHeight - headerHeight - footerHeight - 40;
            content.style.minHeight = Math.max(availableContentHeight, totalContentHeight) + 'px';
          }
        }, 10);
      }

    }
  };

  // Recalculate layout on service toggle
  useEffect(() => {
    const timer = setTimeout(calculatePageHeight, 100);
    return () => clearTimeout(timer);
  }, [currentActiveService]);

  // Initial layout calculation
  useEffect(() => {
    const ensureLayout = () => {
      calculatePageHeight();
    };

    // Run after DOM is ready
    const timer = setTimeout(ensureLayout, 200);

    // Only listen for window resize on desktop to prevent mobile glitching
    const handleResize = () => {
      if (window.innerWidth > 768) {
        calculatePageHeight();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="services-page-container">
      <Layout title="Services - Precision Auto Center" showPreloader={loading}>
      <style jsx global>{`
        body {
          height: auto !important;
          overflow: hidden !important;
        }
        .services-page-container body,
        .services-page-container html {
          margin: 0 !important;
          padding: 0 !important;
        }
        .services-page-container #wrapper {
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .services-page {
          margin: 0 !important;
          padding: 0 !important;
          flex: 1 !important;
          min-height: calc(100vh - 200px) !important;
        }
        .services-page-container footer {
          position: relative !important;
          z-index: 1 !important;
          flex-shrink: 0 !important;
          margin-top: auto !important;
        }

        /* Dynamic height calculation based on content */
        .services-page-container {
          min-height: 100vh !important;
        }

        /* Fix mobile scrolling service card disappearing */
        .services-page .service-containers {
          overflow: visible !important;
          transform: translateZ(0) !important;
          -webkit-transform: translateZ(0) !important;
          will-change: auto !important;
          position: relative !important;
          z-index: 1 !important;
        }

        .services-page .row {
          overflow: visible !important;
          transform: translateZ(0) !important;
          -webkit-transform: translateZ(0) !important;
          position: relative !important;
          z-index: 1 !important;
        }

        /* Additional mobile fixes */
        @media (max-width: 768px) {
          .services-page {
            overflow: visible !important;
            -webkit-overflow-scrolling: touch !important;
          }

          .services-page .service-container,
          .services-page .service-card-new,
          .services-page .service-badge {
            visibility: visible !important;
            opacity: 1 !important;
            display: block !important;
          }

          /* Prevent snapback on mobile scroll */
          .services-page-container #wrapper {
            height: auto !important;
            min-height: 100vh !important;
          }

          .services-page {
            min-height: auto !important;
            height: auto !important;
          }

          body {
            overflow-x: hidden !important;
            overflow-y: auto !important;
          }
        }
        .service-toggle-btn {
          min-height: 50px !important;
          height: 50px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        /* Override tablet CSS to preserve desktop service card layout */
        @media (max-width: 1024px) and (min-width: 769px) {
          .services-page .service-container {
            position: relative !important;
            display: flex !important;
            align-items: stretch !important;
            min-height: 320px !important;
            margin-bottom: 30px !important;
            padding-top: 0 !important;
            overflow: visible !important;
          }

          .services-page .service-card-new {
            background: #333333 !important;
            border: none !important;
            transition: all 0.3s ease !important;
            overflow: visible !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            padding-left: 70px !important;
            padding-top: 20px !important;
            padding-bottom: 20px !important;
            padding-right: 20px !important;
            margin-left: 60px !important;
            margin-top: 0 !important;
            border-radius: 10px !important;
            min-height: 320px !important;
            text-align: left !important;
          }

          .services-page .service-badge {
            position: absolute !important;
            top: 30% !important;
            left: 4% !important;
            transform: translateY(-50%) !important;
            width: 80px !important;
            height: 80px !important;
            border-radius: 50% !important;
            border: 4px solid #dc2626 !important;
            background: #111 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 3 !important;
          }

          .services-page .service-badge img {
            width: 70px !important;
            height: 70px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            transition: transform 0.3s ease !important;
          }

          .services-page .service-title {
            text-align: left !important;
            margin-top: 0 !important;
          }

          .services-page .service-description {
            text-align: left !important;
            margin-bottom: 15px !important;
          }
        }

        /* Override mobile CSS to preserve desktop service card layout */
        @media (max-width: 768px) {
          /* Disable all animations and transitions on mobile */
          .services-page * {
            animation: none !important;
            transition: none !important;
            -webkit-transition: none !important;
          }

          .services-page .spacer-double {
            padding: 40px 0 !important;
          }
          .service-toggle-btn {
            min-height: 45px !important;
            height: 45px !important;
            font-size: 11px !important;
            white-space: normal !important;
            line-height: 1.2 !important;
          }

          /* Preserve desktop service card layout on mobile */
          .services-page .service-container {
            position: relative !important;
            display: flex !important;
            align-items: stretch !important;
            min-height: 320px !important;
            margin-bottom: 30px !important;
            padding-top: 0 !important;
            overflow: visible !important;
            transform: none !important;
            -webkit-transform: none !important;
            will-change: auto !important;
            backface-visibility: visible !important;
            -webkit-backface-visibility: visible !important;
          }

          .services-page .service-card-new {
            background: #333333 !important;
            border: none !important;
            transition: none !important;
            overflow: visible !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            padding-left: 70px !important;
            padding-top: 20px !important;
            padding-bottom: 20px !important;
            padding-right: 20px !important;
            margin-left: 60px !important;
            margin-top: 0 !important;
            border-radius: 10px !important;
            min-height: 320px !important;
            text-align: left !important;
            transform: none !important;
            -webkit-transform: none !important;
            will-change: auto !important;
            backface-visibility: visible !important;
            -webkit-backface-visibility: visible !important;
            position: relative !important;
            z-index: 2 !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          .services-page .service-badge {
            position: absolute !important;
            top: 30% !important;
            left: 7% !important;
            transform: translateY(-50%) !important;
            -webkit-transform: translateY(-50%) !important;
            width: 70px !important;
            height: 70px !important;
            border-radius: 50% !important;
            border: 2px solid #dc2626 !important;
            background: #111 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 3 !important;
            will-change: auto !important;
            backface-visibility: visible !important;
            -webkit-backface-visibility: visible !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          .services-page .service-badge img {
            width: 65px !important;
            height: 65px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            transition: none !important;
          }

          .services-page .service-title {
            text-align: left !important;
            margin-top: 0 !important;
          }

          .services-page .service-description {
            text-align: left !important;
            margin-bottom: 15px !important;
          }

          /* Fix bottom padding for mobile service cards */
          .services-page .service-card-new {
            padding-bottom: 25px !important;
          }

          /* Make book now button smaller on mobile */
          .services-page .book-now-btn {
            padding: 6px 10px !important;
            font-size: 10px !important;
            min-height: 32px !important;
            height: 32px !important;
          }
        }

        /* Tablet view - 769px to 1024px */
        @media (max-width: 1024px) and (min-width: 769px) {
          .services-page .service-badge img {
            width: 75px !important;
            height: 75px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            transition: transform 0.3s ease !important;
          }
        }
      `}</style>
      <div className="no-bottom no-top services-page" id="content">
        <div id="top"></div>

        {/* Page Header Section - Exactly like original services.html */}
        <section className="jarallax" style={{flexGrow: 1}}>
          <div className="container relative z-3" style={{  paddingTop: '15px' }}>
            <div className="spacer-single"></div>
            <div className="row g-4 justify-content-center">
              <div className="col-lg-12 text-center">
                <div className="subtitle">Choose Your Service</div>
                
                {/* Toggle Buttons - Bootstrap 3-column layout on mobile */}
                <div className="service-buttons mb-0" style={{ display: showBookingModal ? 'none' : 'block' }}>
                  <div className="container-fluid">
                    <div className="row g-2">
                      <div className="col-4 col-md-2">
                        <button
                          className={`service-toggle-btn w-100 ${currentActiveService === 'detailing' ? 'active' : ''}`}
                          data-target="detailing"
                          onClick={() => handleServiceToggle('detailing')}
                        >
                          DETAILING
                        </button>
                      </div>
                      <div className="col-4 col-md-2">
                        <button
                          className={`service-toggle-btn w-100 ${currentActiveService === 'vehicle-wrap' ? 'active' : ''}`}
                          data-target="vehicle-wrap"
                          onClick={() => handleServiceToggle('vehicle-wrap')}
                        >
                          VEHICLE WRAP
                        </button>
                      </div>
                      <div className="col-4 col-md-2">
                        <button
                          className={`service-toggle-btn w-100 ${currentActiveService === 'ceramic-coating' ? 'active' : ''}`}
                          data-target="ceramic-coating"
                          onClick={() => handleServiceToggle('ceramic-coating')}
                        >
                          CERAMIC COATING
                        </button>
                      </div>
                      <div className="col-4 col-md-2">
                        <button
                          className={`service-toggle-btn w-100 ${currentActiveService === 'paint-protection-film' ? 'active' : ''}`}
                          data-target="paint-protection-film"
                          onClick={() => handleServiceToggle('paint-protection-film')}
                        >
                          PPF
                        </button>
                      </div>
                      <div className="col-4 col-md-2">
                        <button
                          className={`service-toggle-btn w-100 ${currentActiveService === 'powder-coating' ? 'active' : ''}`}
                          data-target="powder-coating"
                          onClick={() => handleServiceToggle('powder-coating')}
                        >
                          POWDER COATING
                        </button>
                      </div>
                      <div className="col-4 col-md-2">
                        <button
                          className={`service-toggle-btn w-100 ${currentActiveService === 'window-tinting' ? 'active' : ''}`}
                          data-target="window-tinting"
                          onClick={() => handleServiceToggle('window-tinting')}
                        >
                          WINDOW TINTING
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Service Containers - Exactly like original */}
                <div className="service-containers">
                  {!showBookingModal && !showServiceDetailModal ? (
                    createServiceContainers(currentActiveService)
                  ) : showServiceDetailModal ? (
                    // Service Detail Modal Content - matching booking modal structure
                    <div className="booking-modal active" id="serviceDetailModal">
                      <div className="booking-container w-100" style={{ maxWidth: 'none' }}>
                        <div className="booking-header">
                          <h2 className="booking-title">{selectedServiceDetail?.title || 'Service Details'}</h2>
                          <button className="close-btn" onClick={closeServiceDetailModal}>&times;</button>
                        </div>

                        <div className="service-detail-content">
                          <div className="service-meta text-center mb-4">
                            <div className="service-badges mb-2">
                              <span className="service-duration-badge text-white px-3 py-2 rounded-pill me-2">
                                <i className="fas fa-clock"></i> {selectedServiceDetail?.duration || 'N/A'}
                              </span>
                              <span className="service-price-badge text-white px-3 py-2 rounded-pill me-2">
                                <i className="fas fa-tag"></i> {selectedServiceDetail?.price || 'Contact for Price'}
                              </span>
                              {/* Additional pricing from database or hardcoded fallback */}
                              {selectedServiceDetail?.additional_pricing && (
                                <span className="additional-pricing-pill text-white px-3 py-2 rounded-pill" style={{ backgroundColor: '#444', fontSize: '13px', fontWeight: '500' }}>
                                  {selectedServiceDetail.additional_pricing}
                                </span>
                              )}
                              {/* Fallback for hardcoded services without additional_pricing field */}
                              {!selectedServiceDetail?.additional_pricing && selectedServiceDetail?.serviceKey === 'detailing' &&
                               ['PRECISION PACKAGE', 'GOLD PACKAGE', 'BRONZE PACKAGE'].includes(selectedServiceDetail?.title) && (
                                <span className="additional-pricing-pill text-white px-3 py-2 rounded-pill" style={{ backgroundColor: '#444', fontSize: '13px', fontWeight: '500' }}>
                                  Add $30 SUV • Add $50 VAN
                                </span>
                              )}
                              {!selectedServiceDetail?.additional_pricing && selectedServiceDetail?.serviceKey === 'vehicle-wrap' &&
                               selectedServiceDetail?.title === 'FULL VEHICLE WRAPS' && (
                                <span className="additional-pricing-pill text-white px-3 py-2 rounded-pill" style={{ backgroundColor: '#444', fontSize: '13px', fontWeight: '500' }}>
                                  SEDAN $2,999.99 • SUV $3,499.99
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="service-full-description mb-4">
                            {needsTwoColumnLayout(selectedServiceDetail?.title) ? (
                              /* Two-column layout for detailing services with Exterior/Interior */
                              <div className="service-detail-two-column">
                                {/* Service Details Column */}
                                <div className="service-detail-column">
                                  <h3 className="text-white mb-4 text-start">Service Details</h3>
                                  <p className="text-white lh-base mb-4 text-start" style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{selectedServiceDetail?.fullDescription || selectedServiceDetail?.description || 'Service details not available.'}</p>
                                </div>

                                {/* What's Included Column */}
                                <div className="service-included-column">
                                  <h4 className="text-white mb-3 text-start">What's Included:</h4>
                                  {(() => {
                                    const allFeatures = getServiceFeatures(selectedServiceDetail?.title, selectedServiceDetail);
                                    const exteriorIndex = allFeatures.findIndex(f => f.type === 'heading' && f.text === 'Exterior');
                                    const interiorIndex = allFeatures.findIndex(f => f.type === 'heading' && f.text === 'Interior');

                                    // Check if this service has Exterior/Interior structure
                                    const hasExteriorInterior = exteriorIndex !== -1 || interiorIndex !== -1;

                                    if (hasExteriorInterior) {
                                      // Detailing services with Exterior/Interior structure
                                      const exteriorFeatures = exteriorIndex !== -1 ?
                                        allFeatures.slice(exteriorIndex + 1, interiorIndex !== -1 ? interiorIndex : undefined) : [];
                                      const interiorFeatures = interiorIndex !== -1 ?
                                        allFeatures.slice(interiorIndex + 1) : [];

                                      return (
                                        <div className="exterior-interior-columns">
                                          {/* Exterior Column */}
                                          <div className="exterior-column">
                                            <h5 className="text-white mb-2 text-start" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                              Exterior
                                            </h5>
                                            <ul className="list-unstyled text-start">
                                              {exteriorFeatures.map((feature, index) => (
                                                <li key={`exterior-${index}`} className="text-white" style={{ fontSize: '13px', marginBottom: '1px' }}>
                                                  <i className="fas fa-check text-white me-1"></i> {feature}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>

                                          {/* Interior Column */}
                                          <div className="interior-column">
                                            <h5 className="text-white mb-2 text-start" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                              Interior
                                            </h5>
                                            <ul className="list-unstyled text-start">
                                              {interiorFeatures.map((feature, index) => (
                                                <li key={`interior-${index}`} className="text-white" style={{ fontSize: '13px', marginBottom: '1px' }}>
                                                  <i className="fas fa-check text-white me-1"></i> {feature}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      // Check for PPF services or other services with special headings
                                      const filmFeaturesIndex = allFeatures.findIndex(f => f.type === 'heading' && (f.text === 'Film Features:' || f.text === 'Film Features :'));

                                      if (filmFeaturesIndex !== -1) {
                                        // PPF services with "What's Included" and "Film Features" structure
                                        const whatIncludedFeatures = allFeatures.slice(0, filmFeaturesIndex);
                                        const filmFeatures = allFeatures.slice(filmFeaturesIndex + 1);

                                        return (
                                          <div className="specifications-features-columns">
                                            {/* What's Included Column */}
                                            <div className="specifications-column">
                                              <h5 className="text-white mb-1 text-start" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                Specifications :
                                              </h5>
                                              <ul className="list-unstyled text-start">
                                                {whatIncludedFeatures.map((feature, index) => (
                                                  <li key={`included-${index}`} className="text-white" style={{ fontSize: '13px', marginBottom: '1px' }}>
                                                    <i className="fas fa-check text-white me-1"></i> {typeof feature === 'string' ? feature : (feature?.text || '')}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>

                                            {/* Film Features Column */}
                                            <div className="features-column">
                                              <h5 className="text-white mb-1 text-start" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                Film Features :
                                              </h5>
                                              <ul className="list-unstyled text-start">
                                                {filmFeatures.map((feature, index) => (
                                                  <li key={`film-${index}`} className="text-white" style={{ fontSize: '13px', marginBottom: '1px' }}>
                                                    <i className="fas fa-check text-white me-1"></i> {typeof feature === 'string' ? feature : (feature?.text || '')}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        // Window tinting and other services with simple feature list
                                        return (
                                          <ul className="list-unstyled text-start">
                                            {allFeatures.map((feature, index) => (
                                              feature.type === 'heading' ? (
                                                <h5 key={index} className="text-white mt-3 mb-2 text-start" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                  {feature.text}
                                                </h5>
                                              ) : (
                                                <li key={index} className="text-white" style={{ fontSize: '13px', marginBottom: '1px' }}>
                                                  <i className="fas fa-check text-white me-1"></i> {feature}
                                                </li>
                                              )
                                            ))}
                                          </ul>
                                        );
                                      }
                                    }
                                  })()}
                                </div>
                              </div>
                            ) : (
                              /* Single-column layout for other services */
                              <div style={{ width: '100%', paddingLeft: '20px', paddingRight: '20px' }}>
                                <h3 className="text-white mb-4 text-start">Service Details</h3>
                                <p className="text-white lh-base mb-4 text-start" style={{ fontSize: '18px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{selectedServiceDetail?.fullDescription || selectedServiceDetail?.description || 'Service details not available.'}</p>

                                {getServiceFeatures(selectedServiceDetail?.title, selectedServiceDetail).length > 0 && (
                                  <div style={{ marginTop: '30px' }}>
                                    <h4 className="text-white mb-3 text-start">What's Included:</h4>
                                    <ul className="list-unstyled text-start">
                                      {getServiceFeatures(selectedServiceDetail?.title, selectedServiceDetail).map((feature, index) => (
                                        feature && feature.type === 'heading' ? (
                                          <h5 key={index} className="text-white mt-3 mb-2 text-start" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                            {feature.text}
                                          </h5>
                                        ) : (
                                          <li key={index} className="text-white" style={{ fontSize: '14px', marginBottom: '2px' }}>
                                            <i className="fas fa-check text-white me-2"></i> {typeof feature === 'string' ? feature : (feature?.text || '')}
                                          </li>
                                        )
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="service-actions d-flex justify-content-center gap-3 mt-4" style={{ paddingBottom: '30px' }}>
                            <button 
                              className="btn btn-main" 
                              onClick={closeServiceDetailModal}
                              style={{ height: '40px', minHeight: '40px', maxHeight: '40px' }}
                            >
                              <span>BACK TO SERVICES</span>
                            </button>
                            <button 
                              className="btn btn-main" 
                              onClick={() => {
                                // Set up booking modal with service details
                                setSelectedService({
                                  title: selectedServiceDetail?.title,
                                  price: selectedServiceDetail?.price,
                                  duration: selectedServiceDetail?.duration,
                                  description: selectedServiceDetail?.description
                                });
                                setShowServiceDetailModal(false);
                                setShowBookingModal(true);
                                setBookingStep('calendar');
                              }}
                              style={{ height: '40px', minHeight: '40px', maxHeight: '40px' }}
                            >
                              <span>BOOK NOW</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : showBookingModal ? (
                    // Booking Modal Content - exactly like original services.js
                    <div className="booking-modal active" id="bookingModal">
                      <div className="booking-container">
                        <div className="booking-header">
                          <h2 className="booking-title">Book {selectedService?.title}</h2>
                          <button className="close-btn" onClick={closeBookingModal}>&times;</button>
                        </div>
                        
                        <div className="booking-content">
                          {bookingStep === 'calendar' ? (
                            // Calendar and Time Selection Step
                            <>
                              {/* Calendar Section */}
                              <div className="calendar-section">
                                <h3 className="section-title">Select a Date</h3>
                                <div className="calendar-header">
                                  <button 
                                    className="calendar-nav" 
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                  >
                                    &lt;
                                  </button>
                                  <span className="month-year">
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                  </span>
                                  <button 
                                    className="calendar-nav"
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                                  >
                                    &gt;
                                  </button>
                                </div>
                                <div className="calendar-grid">
                                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="calendar-day-header">{day}</div>
                                  ))}
                                  {generateCalendar().map((dateObj, index) => (
                                    <div 
                                      key={index}
                                      className={`calendar-day ${!dateObj ? '' : dateObj.available ? 'available' : 'disabled'} ${
                                        selectedDate?.getTime() === dateObj?.date?.getTime() ? 'selected' : ''
                                      }`}
                                      onClick={() => dateObj && handleDateSelect(dateObj)}
                                    >
                                      {dateObj?.day || ''}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Time Slots Section */}
                              <div className="time-section">
                                <h3 className="section-title">
                                  Available Times for {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  }) : 'Select a date'}
                                </h3>
                                <div className="time-slots">
                                  {isLoading ? (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '20px' }}>
                                      Loading available times...
                                    </div>
                                  ) : !selectedDate ? (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '20px' }}>
                                      Please select a date first
                                    </div>
                                  ) : bookingError ? (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#ff6b6b', padding: '20px' }}>
                                      {bookingError}<br/>
                                      <small>Check console for details</small>
                                    </div>
                                  ) : availableTimeSlots.length === 0 ? (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '20px' }}>
                                      No times available for this date
                                    </div>
                                  ) : (
                                    availableTimeSlots.map(time => (
                                      <button
                                        key={time}
                                        className={`time-slot available ${selectedTime === time ? 'selected' : ''}`}
                                        onClick={() => handleTimeSelect(time)}
                                      >
                                        {formatTime(time)}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Service Details Section */}
                              <div className="details-section">
                                <div className="service-info">
                                  <h3>{selectedService?.title}</h3>
                                  <p>{selectedService?.description}</p>
                                  <p><strong>Duration:</strong> {selectedService?.duration}</p>
                                  <p><strong>Price:</strong> {selectedService?.price}</p>
                                </div>

                                {selectedDate && selectedTime && (
                                  <div className="booking-summary" style={{ display: 'block' }}>
                                    <div className="summary-item">
                                      <span>Service:</span>
                                      <span className="summary-value">{selectedService?.title}</span>
                                    </div>
                                    <div className="summary-item">
                                      <span>Date:</span>
                                      <span className="summary-value">{selectedDate.toLocaleDateString()}</span>
                                    </div>
                                    <div className="summary-item">
                                      <span>Time:</span>
                                      <span className="summary-value">{formatTime(selectedTime)}</span>
                                    </div>
                                    <div className="summary-item">
                                      <span>Total:</span>
                                      <span className="summary-value">{selectedService?.price}</span>
                                    </div>
                                  </div>
                                )}

                                <div className="next-button-container">
                                  <button 
                                    type="button" 
                                    className={`next-btn btn-main fx-slide ${!(selectedDate && selectedTime) ? 'disabled' : ''}`}
                                    onClick={() => setBookingStep('form')}
                                    disabled={!(selectedDate && selectedTime)}
                                  >
                                    <span>NEXT</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            // Booking Form Step
                            <div className="booking-form-content">
                              {/* Left Column: Customer Information Form */}
                              <div className="customer-form-section">
                                <h3>Your Information</h3>
                                <form className="customer-info-form" onSubmit={handleBookingSubmit}>
                                  <div className="form-row">
                                    <div className="form-group">
                                      <label htmlFor="customerName">Full Name *</label>
                                      <input 
                                        type="text" 
                                        id="customerName" 
                                        name="customerName" 
                                        value={bookingForm.customerName}
                                        onChange={(e) => setBookingForm(prev => ({...prev, customerName: e.target.value}))}
                                        required 
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label htmlFor="customerEmail">Email Address *</label>
                                      <input 
                                        type="email" 
                                        id="customerEmail" 
                                        name="customerEmail" 
                                        value={bookingForm.customerEmail}
                                        onChange={(e) => setBookingForm(prev => ({...prev, customerEmail: e.target.value}))}
                                        required 
                                      />
                                    </div>
                                  </div>
                                  <div className="form-row">
                                    <div className="form-group">
                                      <label htmlFor="customerPhone">Phone Number *</label>
                                      <input 
                                        type="tel" 
                                        id="customerPhone" 
                                        name="customerPhone" 
                                        value={bookingForm.customerPhone}
                                        onChange={(e) => setBookingForm(prev => ({...prev, customerPhone: e.target.value}))}
                                        required 
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label htmlFor="vehicleInfo">Vehicle Make/Model/Year</label>
                                      <input 
                                        type="text" 
                                        id="vehicleInfo" 
                                        name="vehicleInfo" 
                                        placeholder="e.g., 2020 Honda Civic"
                                        value={bookingForm.vehicleInfo}
                                        onChange={(e) => setBookingForm(prev => ({...prev, vehicleInfo: e.target.value}))}
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <label htmlFor="specialRequests">Special Requests (Optional)</label>
                                    <textarea 
                                      id="specialRequests" 
                                      name="specialRequests" 
                                      rows="4" 
                                      placeholder="Any specific requirements or notes..."
                                      value={bookingForm.specialRequests}
                                      onChange={(e) => setBookingForm(prev => ({...prev, specialRequests: e.target.value}))}
                                    />
                                  </div>
                                  
                                  {/* Form Actions */}
                                  <div className="form-actions">
                                    <button 
                                      type="button" 
                                      className="back-btn" 
                                      onClick={() => setBookingStep('calendar')}
                                    >
                                      <span>BACK</span>
                                    </button>
                                    <button 
                                      type="submit" 
                                      className="confirm-booking-btn"
                                      disabled={bookingStatus.loading}
                                    >
                                      <span>{bookingStatus.loading ? 'PROCESSING...' : 'CONFIRM BOOKING'}</span>
                                    </button>
                                  </div>
                                </form>
                              </div>
                              
                              {/* Right Column: Booking Summary */}
                              <div className="booking-summary-column">
                                <div className="booking-summary-header">
                                  <h3>Booking Summary</h3>
                                  <div className="summary-details">
                                    <div className="summary-item">
                                      <span>Service:</span>
                                      <span className="summary-value">{selectedService?.title}</span>
                                    </div>
                                    <div className="summary-item">
                                      <span>Date:</span>
                                      <span className="summary-value">{selectedDate?.toLocaleDateString()}</span>
                                    </div>
                                    <div className="summary-item">
                                      <span>Time:</span>
                                      <span className="summary-value">{formatTime(selectedTime)}</span>
                                    </div>
                                    <div className="summary-item">
                                      <span>Duration:</span>
                                      <span className="summary-value">{selectedService?.duration}</span>
                                    </div>
                                    <div className="summary-item">
                                      <span>Price:</span>
                                      <span className="summary-value">{selectedService?.price}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Success/Error Messages */}
                                <div className="booking-messages">
                                  {bookingStatus.success && (
                                    <div className="success-message" style={{ display: 'block' }}>
                                      <i className="fas fa-check-circle"></i>
                                      <div>
                                        <p><strong>Booking Confirmed!</strong></p>
                                        <p>Your appointment has been scheduled successfully.</p>
                                        {bookingStatus.bookingReference && (
                                          <p><strong>Booking Reference:</strong> {bookingStatus.bookingReference}</p>
                                        )}
                                        <p><strong>Important:</strong> Please save this confirmation and arrive 10-15 minutes early.</p>
                                        <p><strong>Contact:</strong> <a href="tel:+19056703484" style={{ color: 'inherit', textDecoration: 'underline' }}>(905) 670-3484</a> | pacwebsite10@gmail.com</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {bookingStatus.error && (
                                    <div className="error-message" style={{ display: 'block' }}>
                                      <i className="fas fa-exclamation-triangle"></i>
                                      <div>
                                        <p><strong>Booking Failed</strong></p>
                                        <p>{bookingStatus.error}</p>
                                        <p>Please try again or call us directly at <a href="tel:+19056703484" style={{ color: 'inherit', textDecoration: 'underline' }}>(905) 670-3484</a></p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {bookingStatus.loading && (
                                    <div className="loading" style={{ display: 'block' }}>
                                      <i className="fas fa-spinner fa-spin"></i>
                                      <p>Processing your booking...</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

              </div>
            </div>
          </div>
        </section>

      </div>
      </Layout>
    </div>
  );
}