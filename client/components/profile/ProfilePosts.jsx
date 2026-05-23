import PostCard from "../PostCard";

export default function ProfilePosts({ posts }) {
  if (!posts.length) {
    return (
      <div className="dark-card rounded-[24px] sm:rounded-[32px] p-8 sm:p-14 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center text-2xl sm:text-3xl">
          ✨
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold mt-5 sm:mt-6">
          No Posts Yet
        </h2>

        <p className="text-[#9ca3af] mt-3 max-w-md mx-auto leading-6 sm:leading-7 text-sm sm:text-base">
          This user hasn’t shared any posts yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-[#0f172a] border border-white/5 rounded-[22px] sm:rounded-[30px] p-1.5 sm:p-2 overflow-hidden"
        >
          <PostCard
            id={post.id}
            title={post.title}
            content={post.content}
            votes={post.votes}
            commentCount={post.commentCount}
            author={post.author.username}
            authorId={post.author.id}
            community={post.community}
          />
        </div>
      ))}
    </div>
  );
}
