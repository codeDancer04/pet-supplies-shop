import React, { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import ImageLink from '../ImageLink';
import axios from 'axios';
import styles from './index.module.css';

const App: React.FC = () =>{

  const [carousel,setCarousel] = useState<string[]>([])

  const axiosCarousel = async() =>{
    const res = await axios('/api/carousel');
    setCarousel(res.data.data);
  }

  useEffect(()=>{
    axiosCarousel();
  },[]);

  return (
  <Carousel  autoplay={{ dotDuration: true }} autoplaySpeed={3000} arrows={true} >
    <div className={styles['imglink-container']}>
      <ImageLink imgUrl={carousel[0]} href='#' imgWidth='100%' imgHeight='100%'/>
    </div>
    <div className={styles['imglink-container'] }>
      <ImageLink imgUrl={carousel[1]} href='#' imgWidth='100%' imgHeight='100%'/>
    </div>
    <div className={styles['imglink-container']}>
      <ImageLink imgUrl={carousel[2]} href='#' imgWidth='100%' imgHeight='100%'/>
    </div>
    <div className={styles['imglink-container']}>
      <ImageLink imgUrl={carousel[3]} href='#' imgWidth='100%' imgHeight='100%'/>
    </div>
  </Carousel>
);
} 

export default App;