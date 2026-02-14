import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faUpload,
  faChartBar,
  faTable,
  faDatabase,
  faQuestionCircle,
  faEdit,
  faLightbulb,
  faDownload,
  faThumbsDown,
  faThumbsUp,
  faTrashAlt,
  faPlus,
  faBan,
  faSort,
  faSortUp,
  faSortDown,
  faSpinner,
  faLink
} from '@fortawesome/free-solid-svg-icons';

export default function configureFa(): void {
  library.add(
    faUpload,
    faChartBar,
    faTable,
    faDatabase,
    faQuestionCircle,
    faEdit,
    faLightbulb,
    faDownload,
    faThumbsUp,
    faThumbsDown,
    faTrashAlt,
    faPlus,
    faBan,
    faSort,
    faSortUp,
    faSortDown,
    faSpinner,
    faLink
  );
}
