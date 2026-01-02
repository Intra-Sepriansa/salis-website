import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'

export default function NotFound() {
  return (
    <div className='mt-20'>
      <EmptyState
        title='Halaman tidak ditemukan'
        description='URL yang kamu akses tidak tersedia. Yuk kembali ke beranda.'
        actionLabel='Kembali ke Home'
        actionTo='/'
      />
    </div>
  )
}
