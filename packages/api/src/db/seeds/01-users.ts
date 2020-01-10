import Knex from 'knex'
import dotenv from 'dotenv'
import { cloak as cloakUser, User, USERS_TABLE } from '../models/auth/Users'
import { createKeychainRecord } from '../models/entities/Keychains'
import { TwoFactorStatus } from '../../auth/types'

export const testUserCredentials = {
  username: 'admin@example.com',
  password: 'password',
  userID: '___testUserId___'
}

export const seed = async (knex: Knex) => {
  dotenv.config()
  if (process.env.NODE_ENV === 'production') {
    return
  }
  try {
    const { username, userID } = testUserCredentials

    const user: User = {
      id: userID,

      ...(await cloakUser({
        username,
        srpSalt: 'yx8wZGqgSmzK9WetvW4ARyvmyqzQYth163C1N35Bhr8=',
        srpVerifier:
          'AeCsGFenff47ZPlCOXN3Ybmd8GpUK64mfspkxSkRyjpv-UP3V7qW-sACog4U7AwnfB3F8BaZ9h_bhEwa6_din__EL7c4lVqKnDPqss-3FjSNWlMaemKhrx1f7Vzi_8mEwCOKYeabGlKBuEcY-UsPfGyNoKmIiZbvLAWkK2gC-TX4Hc9n952DaxdCVTQc654xdUmCnrzYYDAn9fJj6krEwY5i31CW0d0MQVROUrkakcPeKp-ELaPs61WTGuCaayqukV75Lxcg0ddWgbWKQVrOwAjU690O78f3gjmdjh9OmSLthhqFkf322dzi7DuhVok2PxUUWfbxE9uWtoTScDXqmA==',
        masterSalt: '3tsfjXRM_0ocgcU8c9PRNk7o3SzMimjA572mLnAdReg=',
        twoFactorSecret: 'V2F3CZPN3JMZDA4S2DD3IXHYYTYB7Q3F',
        twoFactorBackupCodes: [
          '7240afa8-3215a4e6-cd78cb3b-0563147b',
          '523bab2b-8c608131-9c427d2e-74a7b519',
          '242bc2a7-da454383-2204945c-d9cf1bac',
          '5cbf429a-4afddc8f-61559fbb-11873181',
          '29bc2ce3-b2656f6b-5f89a8a4-e35add7e',
          'dec705ef-8e380128-40d86f68-20bec3ff',
          'e6f68e4b-2c83e14f-ef74249b-6b83000d',
          'c298f7de-acc703ab-6497911c-1a611bae'
        ].join(','),
        twoFactorStatus: TwoFactorStatus.verified
      }))
    }
    await knex.insert(user).into(USERS_TABLE)
    await createKeychainRecord(knex, {
      userID,
      key:
        'v1.aesgcm256.cbf0abc6.LjC5T9lRrrSo4zRA.IlKI6sBsFKBQKGE7o3FdnM0_hHtzY10Q3od5w2DAtht72cOR-_ePR6x1LcqCses15YPxO01tPtDULoYv58UDKhrYFWHLUuNhMg==',
      signaturePublicKey: 'IvF19NCP8zI8G3BsHCUR_txpj9hXEpzK3yxZElDlGZY=',
      sharingPublicKey: '3ukcOWdcsgAkR0yXaNUS61ZlGz1lzfZbtDVBIQPCfEo=',
      sharingSecretKey:
        'v1.aesgcm256.06901cef.YHosFWmlACIO-zzB.OTvZCj9xu6v-JtuJAQYytmb2riuau-x4aUhSBD5gkVyg5RBizIBoc7qv-w582BRw14mjBRqU0L5uNq7Z8C16s91A4NKngvcA-F-KG38OQf7ZHFQz5sS_eMkk-vVTf-x18Y2JIzHBOv0=',
      signatureSecretKey:
        'v1.aesgcm256.06901cef.UhsrMynpZpmyrpTZ.8TN00M_328yF-WVpihWEr1jYhv_bTv1wx34SpUmhItd1YunzVR0AzDdJuXkT8M-NwoaTcWLoujuF90neycYKdJVw-mZIEO53opiJcYBKL1YB3H45CeIPskMm6J5xY8NL2mgJZ7l7in8='
    })
  } catch (error) {
    console.error(error)
  }
}
