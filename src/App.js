import {action,originals,comedy,horror,romance, documentaries} from './urls'
import './App.css';
import Banner from './Components/Banner/Banner';
import Navbar from './Components/Navbar/Navbar';
import Rowpost from './Components/Rowpost/Rowpost';


function App() {
  return (
    <div className="App">
     <Navbar/>
     <Banner/>
     <Rowpost url={originals} title='Netflix Originals'/>
     <Rowpost url={action} title='Action' isSmall />
     <Rowpost url={comedy} title='Comedy' isSmall />
     <Rowpost url={horror} title='Horror' isSmall />
     <Rowpost url={romance} title='Romantic Movies' isSmall />
     <Rowpost url={documentaries} title='Documentary Films' isSmall />
    </div>
  );
}

export default App;
