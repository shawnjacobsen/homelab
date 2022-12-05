
type IPost = {
  likeCount: number
  commentCount: number
  caption: string
  date: Date
}

type IInstaUser = {
  username: string
  bio: string,
  followers: Array<string>
  following: Array<string>
  posts: Array<IPost>
}

async function getUser(username:string):Promise<IInstaUser> {
  if (username === "prod.maniac") {
    return {
      username:"prod.maniac",
      following:["user_1", "user_2"],
      followers:["user_A", "user_B"],
      bio: "some producer who's a beat maker",
      posts: [],
    }
  }
  const user:IInstaUser = {
    username: "user" + Math.floor(Math.random() * 100),
    following:["user_" + Math.floor(Math.random() * 100), "user_" + Math.floor(Math.random() * 100)],
    followers:["user_A" + Math.floor(Math.random() * 100), "user_B" + Math.floor(Math.random() * 100)],
    bio: "some producer who's a beat maker",
    posts: []
  }

  return user
}

/**
 * Callback to check if a user is highPriority (should not be unfollowed)
 * @param user The primary user
 * @returns If candidate is high prioirty (should not be unfollowed)
 */
type IIsHighPriority = (user:IInstaUser, candidate:IInstaUser) => boolean
const hp_FollowingBack_Producer:IIsHighPriority = (user,candidate) => {
  let isHighPriority:boolean = false

  const isFollowingBack:boolean = candidate.following.includes(user.username)
  const isProducer:boolean = 
        candidate.username.includes("prod")
    ||  candidate.bio.toLowerCase().includes("producer")
    ||  candidate.bio.toLowerCase().includes("beat")
  isHighPriority = isFollowingBack || isProducer
  return isHighPriority
}

/**
 * based on specified username (i.e. "prod.maniac"),
 * iterate over following and unfollows first found that isn't high priortiy
 * 
 * @param username          itereate ove rthis user's following to unfollow
 * @param isHighPriority    callback to check if a user is highPriority (should not be unfollowed)
 * @param waitTime          time (ms) to wait before unfollowing someone else
 * @returns void
 */
export async function unfollowUser(username:string, isHighPriority:IIsHighPriority):Promise<void> {
  const primaryUser:IInstaUser = await getUser(username)
  const x = "123"
  primaryUser.following.some(async candidateUsername => {
    const candidate:IInstaUser = await getUser(candidateUsername)
    if (isHighPriority(primaryUser, candidate)) {
      console.log(`unfollowed ${candidate.username}`)
      console.log(candidate)
      return true // break
    }
    return false // continiue
  })
}

(async () => {
  const primaryUsername = "prod.maniac"
  unfollowUser(primaryUsername, hp_FollowingBack_Producer)
  
})()
