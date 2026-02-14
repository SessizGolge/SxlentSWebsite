let postsContainer = document.getElementById("postsContainer");

// GREETING
function updateGreeting() {
  const title = document.querySelector(".home-title");
  const subtitle = document.querySelector(".home-subtitle");

  const hour = new Date().getHours();

  if (hour < 5) {
    title.textContent = "Still up, huh?";
    subtitle.textContent = "Running on pure willpower right now.";
  } else if (hour < 12) {
    title.textContent = "Good morning.";
    subtitle.textContent = "Fresh start, clean mind.";
  } else if (hour < 18) {
    title.textContent = "Good afternoon.";
    subtitle.textContent = "Chill vibe hours.";
  } else {
    title.textContent = "Good evening.";
    subtitle.textContent = "Long day, sit back for a sec.";
  }
}
updateGreeting();

// CHECK FOR NEW POSTS
async function checkForNewPosts() {
  try {
    const response = await fetch("/jsons/posts.json");
    const posts = await response.json();

    if (posts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for date comparison
      
      // Check if ANY post is from today
      let hasNewPost = false;
      
      posts.forEach(post => {
        const postDate = new Date(post.date);
        postDate.setHours(0, 0, 0, 0); // Reset time for comparison
        
        if (postDate.toDateString() === today.toDateString()) {
          hasNewPost = true;
        }
      });
      
      console.log("Today's date:", today.toDateString());
      console.log("Has new post from today?", hasNewPost);
      
      if (hasNewPost) {
        const postsBtn = document.querySelector('a[href="/posts/"]');
        if (postsBtn) {
          postsBtn.classList.add('has-new-post');
          
          // Add badge
          const badge = document.createElement('span');
          badge.className = 'new-post-indicator';
          badge.textContent = 'New!';
          postsBtn.appendChild(badge);
          console.log("New post badge added!");
        }
      }
    }
  } catch (error) {
    console.error('Error checking for new posts:', error);
  }
}

checkForNewPosts();
