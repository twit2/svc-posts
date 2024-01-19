import './PostsMgr.test';

jest.mock('./PostsStore', ()=>({
    ...jest.requireActual('./PostsStore'),
    PostsStore: require('./PostsStore.mock').PostsStore
}));