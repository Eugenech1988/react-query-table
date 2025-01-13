import React, { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolar } from '@/SchoolarContext.tsx';
import styles from './style.module.scss'

const SchoolarCard: React.FC = () => {
  const navigate = useNavigate();
  const { schoolar, setSchoolar } = useSchoolar();

  useLayoutEffect(() => {
    if (!schoolar) {
      navigate('/');
    }
  },[])

  const handleBackClick = () => {
    setSchoolar(null);
    navigate('/');
  }

  if (!schoolar) return null;

  return (
    <div className={styles.wrapper}>
      <button className={styles.backBtn} onClick={handleBackClick}>{`< Назад`}</button>
      <div className={styles.cardWrapper}>
        <p className={styles.cardText}>{schoolar?.FirstName || 'John'}</p>
        <p className={styles.cardText}>{schoolar?.LastName}</p>
        <p className={styles.cardText}>{schoolar?.SecondName || 'Doe'}</p>
      </div>
    </div>
  )
}

export default SchoolarCard;