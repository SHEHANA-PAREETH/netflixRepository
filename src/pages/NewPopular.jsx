import { useEffect } from 'react'
import { getList } from '../api/tmdb'
import Row from '../components/Row'

const today = () => getList('trending/all/day')
const thisWeek = () => getList('trending/all/week')
const cinemas = () => getList('movie/now_playing', 'movie')
const upcoming = () => getList('movie/upcoming', 'movie')
const airing = () => getList('tv/on_the_air', 'tv')
const topTv = () => getList('tv/top_rated', 'tv')

export default function NewPopular() {
  useEffect(() => { document.title = 'New & Popular – Netflix Clone' }, [])
  return (
    <div className="page">
      <div className="toolbar"><h1>New &amp; Popular</h1></div>
      <div className="rows flush">
        <Row title="Trending today" load={today} variant="backdrop" />
        <Row title="This week's most watched" load={thisWeek} />
        <Row title="Coming soon" load={upcoming} variant="backdrop" />
        <Row title="Now in cinemas" load={cinemas} />
        <Row title="TV on the air" load={airing} />
        <Row title="All-time favourite series" load={topTv} />
      </div>
    </div>
  )
}
