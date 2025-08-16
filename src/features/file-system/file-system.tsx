import FolderActions from '@features/file-system/components/folder-actions/folder-actions';
import FolderList from '@features/file-system/components/folder-list/folder-list';

const FileSystem = () => {
  return (
    <>
      <FolderActions />
      <FolderList />
    </>
  );
};

export default FileSystem;
