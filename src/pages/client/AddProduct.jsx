import React from 'react';
import { BsBoxSeam, BsPlus } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductForm from '../../components/forms/ProductForm';
import PageWrapper from '../../components/common/PageWrapper';

export default function AddProduct() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BsPlus size={26} className="text-blue-500" />
          {t('products.addNewProduct')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('products.addProductSubtitle')}</p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
              <BsBoxSeam size={26} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('products.productInformation')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('products.fillInDetails')}</p>
          </div>
          <ProductForm onCreated={() => navigate('/client/products')} />
        </div>
      </div>
    </PageWrapper>
  );
}
