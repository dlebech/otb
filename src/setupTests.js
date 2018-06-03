import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureFa from './configureFa';

configureFa();
configure({ adapter: new Adapter() });