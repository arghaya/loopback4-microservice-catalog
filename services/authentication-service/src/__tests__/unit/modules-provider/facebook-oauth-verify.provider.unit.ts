import {
  StubbedInstanceWithSinonAccessor,
  createStubInstance,
  expect,
} from '@loopback/testlab';
import {UserCredentialsRepository, UserRepository} from '../../../repositories';
import sinon from 'sinon';
import {FacebookOauth2VerifyProvider} from '../../../modules/auth/providers/facebook-oauth-verify.provider';
import {FacebookSignUpFn} from '../../../providers';
import * as FacebookStrategy from 'passport-facebook';
import {
  User,
  UserCredentials,
  UserCredentialsWithRelations,
  UserWithRelations,
} from '../../../models';
import {IAuthUser} from 'loopback4-authentication';

describe('Facebook Verify Provider', () => {
  let userRepo: StubbedInstanceWithSinonAccessor<UserRepository>;
  let userCredentialRepo: StubbedInstanceWithSinonAccessor<UserCredentialsRepository>;
  let facebookVerifyProvider: FacebookOauth2VerifyProvider;

  const signupProvider: FacebookSignUpFn = async (
    profile: FacebookStrategy.Profile,
  ) => {
    return null;
  };
  const preVerifyProvider = async (
    accessToken: string,
    refreshToken: string,
    profile: FacebookStrategy.Profile,
    user: IAuthUser | null,
  ) => {
    return user;
  };
  const postVerifyProvider = async (
    profile: FacebookStrategy.Profile,
    user: IAuthUser | null,
  ) => {
    return user;
  };

  const accessToken = 'test_access_token';
  const refreshToken = 'test_refresh_token';
  const profile = {
    id: '1',
    _json: {
      email: 'xyz@gmail.com',
    },
  };

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  describe('facebook oauth2 verify provider', () => {
    it('checks if provider returns a function', async () => {
      const result = facebookVerifyProvider.value();
      expect(result).to.be.Function();
    });

    it('return error promise for no user', async () => {
      const func = facebookVerifyProvider.value();
      const result = func(accessToken, refreshToken, profile);
      expect(result).to.be.Promise();
    });

    it('return error promise if there is no user cred', async () => {
      const user = new User({
        id: '1',
        firstName: 'test',
        lastName: 'test',
        username: 'test_user',
        email: 'xyz@gmail.com',
        authClientIds: '{1}',
        dob: new Date(),
      });
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(user as UserWithRelations);
      const func = facebookVerifyProvider.value();
      const result = func(accessToken, refreshToken, profile);
      expect(result).to.be.Promise();
      sinon.assert.calledOnce(findOne);
    });

    it('return user after post verification', async () => {
      const user = new User({
        id: '1',
        firstName: 'test',
        lastName: 'test',
        username: 'test_user',
        email: 'xyz@gmail.com',
        authClientIds: '{1}',
        dob: new Date(),
      });
      const userCred = new UserCredentials({
        id: '1',
        userId: '1',
        authProvider: 'facebook',
        authId: '1',
      });
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(user as UserWithRelations);
      const findTwo = userCredentialRepo.stubs.findOne;
      findTwo.resolves(userCred as UserCredentialsWithRelations);
      const func = facebookVerifyProvider.value();
      const result = func(accessToken, refreshToken, profile);
      expect(result).to.be.Promise();
      sinon.assert.calledOnce(findOne);
    });
  });

  function setUp() {
    userRepo = createStubInstance(UserRepository);
    userCredentialRepo = createStubInstance(UserCredentialsRepository);
    facebookVerifyProvider = new FacebookOauth2VerifyProvider(
      userRepo,
      userCredentialRepo,
      signupProvider,
      preVerifyProvider,
      postVerifyProvider,
    );
  }
});
